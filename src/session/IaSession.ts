import Catalog from "../catalog/Catalog";
import CatalogTask from "../catalog/CatalogTask";
import { IaApiError, IaApiInvalidIdentifierError, IaApiItemNotFoundError, IaApiNotFoundError } from "../error";
import IaCollection from "../item/IaCollection";
import { IaItem } from "../item/IaItem";
import log from "../logging/log";
import { IaMetadataRequest } from "../request/IaMetadataRequest";
import {
    HttpHeaders,
    IaApiGetRateLimitResult,
    IaAuthConfig,
    IaCheckIdentifierResponse,
    IaFileBaseMetadata,
    IaGetTasksBasicParams,
    IaGetTasksParams,
    IaHttpRequestDeleteParams,
    IaHttpRequestGetParams,
    IaHttpRequestPostParams,
    IaItemBaseMetadata,
    IaItemData,
    IaItemMetadata,
    IaRawMetadata,
    IaSessionSearchItemsParams,
    IaTaskPriority,
    IaTaskType
} from "../types";
import getUserAgent from "../util/getUserAgent";
import { handleIaApiError } from "../util/handleIaApiError";
import { createS3AuthHeader } from "../util/createS3AuthHeader";
import { IaSearch } from "../search/IaSearch";

class ArchiveSessionCookies {
    setCookie(cookie: any) {
        throw new Error("Method not implemented.");
    }
}




/** 
 * The {@link IaSession} class collects together useful 
 * functionality from `internetarchive` as well as important
 * data such as configuration information and credentials.
 * 
 * @example
 *
 * import {IaSession} from "internetarchive-ts";
 * const s = new IaSession();
 * const item = await getItem('nasa');
 */
export class IaSession {

    public readonly host: string;
    public readonly protocol: string;
    public readonly url: string;
    public readonly userEmail?: string;
    public readonly accessKey?: string;
    public readonly secretKey?: string;
    public readonly auth?: HttpHeaders;
    protected readonly secure: boolean;
    protected readonly config: IaAuthConfig;
    protected readonly catalog: Catalog;

    /** HTTP Headers */
    public headers: HttpHeaders;

    protected cookies: ArchiveSessionCookies;



    /**
     * Initialize {@link IaSession} object with config.
     * @param config A config dict used for initializing the object.
     * @param configFile Path to config file used for initializing the object.
     * @param debug Set debug behaviour
     */
    public constructor(
        config: IaAuthConfig = {},
        protected debug: boolean = false,
    ) {
        this.cookies = new ArchiveSessionCookies();
        this.catalog = new Catalog(this);

        this.config = config;

        /*for (let ck in this.config.cookies ?? {}) {
            const rawCookie = `${ck}=${this.config.cookies[ck]}`;
            const cookieDict = parseDictCookies(rawCookie);
            if (!cookieDict[ck]) {
                continue;
            }
            const cookie = createCookie(ck, cookieDict[ck], {
                domain: cookieDict.domain ?? '.archive.org',
                path: cookieDict.path ?? '/'
            });
            this.cookies.setCookie(cookie);
        }*/

        this.secure = this.config.general?.secure ?? true;
        this.host = this.config.general?.host ?? 'archive.org';
        this.protocol = this.secure ? 'https:' : 'http:';
        this.url = `${this.protocol}//${this.host}`;



        let userEmail = this.config.cookies?.['logged-in-user'];
        if (userEmail) {
            userEmail = userEmail.split(';')[0];
            userEmail = decodeURIComponent(userEmail!);
            this.userEmail = userEmail;
        }
        this.accessKey = this.config.s3?.access;
        this.secretKey = this.config.s3?.secret;

        if (this.accessKey && this.secretKey) {
            this.auth = createS3AuthHeader(this.accessKey, this.secretKey);
        }

        this.headers = {};
        this.headers['User-Agent'] = getUserAgent(this.accessKey);
        this.headers['Connection'] = 'close';
    }

    /**
     * A method for creating an {@link IaItem} and {@link IaCollection} objects.
     * @param identifier A globally unique Archive.org identifier.
     * @param itemMetadata A metadata dict used to initialize the Item or Collection object. 
     *      Metadata will automatically be retrieved from Archive.org if nothing is provided.
     * @returns 
     */
    public async getItem(identifier: string): Promise<IaItem | IaCollection> {
        const itemData = await this.getMetadata(identifier);
        const mediatype = itemData.metadata.mediatype;
        const itemClass: typeof IaItem = mediatype === "collection" ? IaCollection : IaItem;
        return new itemClass(this, itemData);
    }

    /**
     * Get an Item's metadata from the {@link http://blog.archive.org/2013/07/04/metadata-api/ | Metadata API}
     * @param identifier Globally unique Archive.org identifier.
     * @throws {IaApiError}
     * @throws {IaApiItemNotFoundError} If the item does not exist
     */
    public async getMetadata
        <ItemMetaType extends IaItemBaseMetadata = IaItemMetadata,
            ItemFileMetaType extends IaFileBaseMetadata | IaRawMetadata<IaFileBaseMetadata> = IaFileBaseMetadata>
        (identifier: string): Promise<IaItemData<ItemMetaType, ItemFileMetaType>> {
        const response = await this.get(`${this.url}/metadata/${identifier}`);
        if (response.ok) {
            return response.json().then(json => {
                // The metadata endpoint returns status of 200 with a bodu of "{}" if the item does not exist.
                // We convert this into an error here
                if (Object.keys(json).length === 0) {
                    throw new IaApiItemNotFoundError(`Item "${identifier}" does not exist`, { response });
                }
                return json;
            }) as Promise<IaItemData<ItemMetaType, ItemFileMetaType>>;
        } else {
            throw await handleIaApiError({ response });
        }
    }

    /**
     * Sends a GET Request
     * @param url URL to get
     * @param param1.params Search params
     * @param param1.auth Auth Header, overrides the stored auth of the IaSession instance
     * @param param1.headers Additional HTTP Headers
     * @param param1.stream  
     * @param param1.timeout  
     * @returns 
     */
    public async get(url: string, {
        params,
        auth,
        headers,
        stream,
        timeout
    }: IaHttpRequestGetParams = {}): Promise<Response> {
        // TODO handle stream
        const urlObj = new URL(url);
        if (params) {
            for (const param of Object.entries(params)) {
                const [key, value] = param;
                if (value !== undefined) {
                    urlObj.searchParams.set(key, `${value}`);
                }
            }
        }
        log.verbose(`GET ${urlObj.href}`);
        return fetch(urlObj.href, {
            method: "GET",
            headers: {
                ...this.headers,
                ...headers,
                ...(auth ?? this.auth)
            }
        });
    }

    public async post(url: string, {
        params,
        auth,
        headers,
        body,
        json
    }: IaHttpRequestPostParams): Promise<Response> {
        const urlObj = new URL(url);
        if (params) {
            for (const param of Object.entries(params)) {
                const [key, value] = param;
                if (value !== undefined) {
                    urlObj.searchParams.set(key, `${value}`);
                }
            }
        }

        let contentTypeHeader: HttpHeaders = {};
        if (json !== undefined) {
            body = JSON.stringify(json);
            contentTypeHeader = { 'Content-Type': 'application/json' };
        }

        log.verbose(`GET ${urlObj.href}`);
        return fetch(urlObj.href, {
            method: "POST",
            headers: { ...this.headers, ...headers, ...contentTypeHeader, ...auth },
            body
        });
    }

    public async delete(url: string, {
        params,
        auth,
        headers,
        body,
        json
    }: IaHttpRequestDeleteParams): Promise<Response> {
        const urlObj = new URL(url);
        if (params) {
            for (const param of Object.entries(params)) {
                const [key, value] = param;
                if (value !== undefined) {
                    urlObj.searchParams.set(key, `${value}`);
                }
            }
        }

        let contentTypeHeader: HttpHeaders = {};
        if (json !== undefined) {
            body = JSON.stringify(json);
            contentTypeHeader = { 'Content-Type': 'application/json' };
        }

        return fetch(url, {
            method: "DELETE",
            headers: { ...this.headers, ...headers, ...contentTypeHeader, ...auth },
            body
        });
    }

    public async send(request: IaMetadataRequest, params?: any): Promise<Response> {
        return fetch(request);
    }

    /**
    * Search for items on Archive.org.
    * @param query The Archive.org search query to yield results for. Refer to {@link https://archive.org/advancedsearch.php#raw} for help formatting your query.
    * @param params
    * @param params.fields The metadata fields to return in the search results.
    * @param params.sorts 
    * @param params.params The URL parameters to send with each request sent to the Archive.org Advancedsearch Api.
    * @param params.fullTextSearch Beta support for querying the archive.org Full Text Search API
    * @param params.dslFts Beta support for querying the archive.org Full Text Search API in dsl (i.e. do not prepend `!L` to the `full_text_search` query
    * @param params.maxRetries 
    * @returns A Search object, yielding search results.
    */
    public searchItems(query: string, params: IaSessionSearchItemsParams): IaSearch {
        return new IaSearch(this, query, params);
    }

    /**
     * 
     * @param identifier 
     * @param accessKey 
     * @returns 
     */
    public async s3IsOverloaded(identifier?: string, accessKey?: string): Promise<boolean> {
        const url = `${this.protocol}//s3.us.archive.org`;
        const params = {
            check_limit: '1',
            bucket: identifier,
            accessKey,
        };
        try {
            const response = await this.get(url, { params });
            try {
                const json = await response.json();
                return json.over_limit != 0;
            } catch (err) {
                // TODO not a good way of doing this
                return true;
            }
        } catch (err) {
            // TODO not a good way of doing this
            return true;
        }
    }

    /**
     * Returns rate limit for specified task type
     * @param cmd Task type
     * @returns Rate limit object
     * @throws {IaApiError}
     */
    public getTasksApiRateLimit<T extends IaTaskType>(cmd: IaTaskType = 'derive.php'): Promise<IaApiGetRateLimitResult<T>> {
        return this.catalog.getRateLimit(cmd);
    }

    /**
     * 
     * @param identifier Item identifier.
     * @param cmd Task command to submit, see {@link https://archive.org/services/docs/api/tasks.html#supported-tasks | supported task commands}
     * @param comment A reasonable explanation for why the task is being submitted.
     * @param priority Task priority from 10 to -10 (default: 0).
     * @param data Extra POST data to submit with the request. Refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API}.
     * @param headers Add additional headers to request.
     * @param reducedPriority Submit your derive at a lower priority.
     *        This option is helpful to get around rate-limiting.
     *        Your task will more likely be accepted, but it might
     *        not run for a long time. Note that you still may be
     *        subject to rate-limiting. This is different than
     *        `priority` in that it will allow you to possibly
     *        avoid rate-limiting.
     */
    public submitTask(
        identifier: string,
        cmd: IaTaskType,
        comment: string = '',
        priority: IaTaskPriority = 0,
        data?: Record<string, any>,
        headers: HttpHeaders = {},
        reducedPriority: boolean = false): Promise<Response> {
        return this.catalog.submitTask({
            identifier,
            cmd,
            comment,
            priority,
            data,
            headers: {
                ...headers,
                ...(reducedPriority && { 'X-Accept-Reduced-Priority': '1' })
            }
        });
    }

    /**
     * A generator that returns completed tasks.
     * @param identifier Item identifier.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An iterable of completed CatalogTasks.
     */
    public iterHistory(
        identifier: string,
        params: IaGetTasksBasicParams = {}
    ): AsyncGenerator<CatalogTask> {
        const getTasksParams: IaGetTasksParams = {
            ...params,
            identifier: identifier,
            catalog: 0,
            summary: 0,
            history: 1
        };
        return this.catalog.iterTasks(getTasksParams);
    };

    /**
     * 
     * @param identifier Item identifier.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An iterable of queued or running CatalogTasks.
     */
    public async *iterCatalogTasks(
        identifier?: string,
        params: IaGetTasksBasicParams = {}
    ): AsyncGenerator<CatalogTask> {
        const getTasksParams: IaGetTasksParams = {
            ...params,
            identifier,
            catalog: 1,
            summary: 0,
            history: 0
        };
        return this.catalog.iterTasks(getTasksParams);
    };

    /**
     * Get the total counts of catalog tasks meeting all criteria,
     * @param identifier Item identifier.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns Counts of catalog tasks meeting all criteria.
     */
    public getTasksSummary(identifier: string = "", params?: IaGetTasksParams): any {
        return this.catalog.getSummary(identifier, params);
    }

    /**
     * Get a list of all tasks meeting all criteria.
     * The list is ordered by submission time.
     * @param getTaskParams params for the {@link Catalog.getTasks} method.
     * @returns A set of all tasks meeting all criteria.
     */
    public getTasks(getTaskParams: Omit<IaGetTasksParams, 'limit' | 'summary'>): Promise<CatalogTask[]> {
        return this.catalog.getTasks(getTaskParams);
    }

    /**
     * Get all queued or running tasks.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An array of all queued or running tasks.
     */
    public getMyCatalog(params: Exclude<IaGetTasksParams, 'catalog' | 'summary' | 'history' | 'submitter'> = {}): Promise<CatalogTask[]> {
        return this.getTasks({
            ...params,
            submitter: this.userEmail,
            catalog: 1,
            history: 0
        });
    }

    /**
     * Get a task log.
     * @param taskId The task id for the task log you'd like to fetch.
     * @returns The task log as a string.
     */
    public async getTaskLog(taskId: number): Promise<string> {
        return CatalogTask.getTaskLog(taskId, this);
    }

    /**
    * Check if the item identifier is available for creating a new item.
    * @returns true if identifier is available, or false if it is not available.
    * @throws {IaApiError}
    * @throws {IaApiInvalidIdentifierError}
    */
    public async isIdentifierAvailable(identifier: string): Promise<boolean> {
        const url = `${this.url}/services/check_identifier.php`;
        const params = { output: 'json', identifier: identifier };
        const response = await this.get(url, { params });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        const json = await response.json() as IaCheckIdentifierResponse;
        if (json.type === "error") {
            throw new IaApiError(json.message, { response });
        } else {
            if (json.code === "invalid") {
                throw new IaApiInvalidIdentifierError(json.message, { response });
            }
            return json.code === "available";
        }
    }
}

export default IaSession;


