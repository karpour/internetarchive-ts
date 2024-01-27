import Catalog from "../catalog/Catalog";
import CatalogTask from "../catalog/CatalogTask";
import { IaApiError } from "../error";
import IaCollection from "../item/IaCollection";
import { IaItem } from "../item/IaItem";
import log from "../logging/log";
import { IaMetadataRequest } from "../request/IaMetadataRequest";
import {
    HttpHeaders,
    IaAuthConfig,
    IaGetTasksBasicParams,
    IaGetTasksParams,
    IaHttpRequestDeleteParams,
    IaHttpRequestGetParams,
    IaHttpRequestPostParams,
    IaItemData,
    IaTaskPriority,
    IaTaskType
} from "../types";
import getUserAgent from "../util/getUserAgent";
import { handleIaApiError } from "../util/handleIaApiError";
import { getConfig } from "./config";
import { createS3AuthHeader } from "./createS3AuthHeader";

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
    send(request: IaMetadataRequest, params:any):Response {
        throw new Error("Method not implemented.");
    }
    public readonly host: string;
    public readonly protocol: string;
    public readonly url: string;
    public readonly userEmail?: string;
    public readonly accessKey?: string;
    public readonly secretKey?: string;
    protected readonly auth?: HttpHeaders;
    protected readonly secure: boolean;
    protected readonly config: IaAuthConfig;
    protected readonly configFile: string;
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
        config?: Partial<IaAuthConfig>,
        configFile: string = "",
        protected debug: boolean = false,
    ) {
        this.cookies = new ArchiveSessionCookies();

        this.config = getConfig(config, configFile);
        this.configFile = configFile;
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
        if (!this.host.includes('.archive.org')) {
            this.host += '.archive.org';
        }
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
     * Get an item's metadata from the {@link http://blog.archive.org/2013/07/04/metadata-api/ | Metadata API}
     * @param identifier Globally unique Archive.org identifier.
     * @param requestKwargs Metadata API response.
     */
    public async getMetadata(identifier: string): Promise<IaItemData> {
        const url = `${this.url}/metadata/${identifier}`;
        try {
            const response = await this.get(url);
            if (response.ok) {
                return response.json() as Promise<IaItemData>;
            } else {
                throw await handleIaApiError(response);
            }
        } catch (err: any) {
            const errorMsg = `Error retrieving metadata from ${url}, ${err.message}`;
            log.error(errorMsg);
            throw new IaApiError(errorMsg, { cause: err });
        }
    }

    public async get(url: string, {
        params,
        auth,
        headers
    }: IaHttpRequestGetParams = {}): Promise<Response> {
        const urlObj = new URL(url);
        if (params) {
            for (const param of Object.entries(params)) {
                const [key, value] = param;
                if (value !== undefined) {
                    urlObj.searchParams.set(key, `${value}`);
                }
            }
        }
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
        data
    }: IaHttpRequestPostParams): Promise<Response> {
        return fetch(url, {
            method: "POST",
            headers: { ...this.headers, ...auth }
        });
    }

    public async delete(url: string, {
        params: params,
        auth,
        headers,
        data
    }: IaHttpRequestDeleteParams): Promise<Response> {
        return fetch(url, {
            method: "DELETE",
            headers: { ...this.headers, ...auth }
        });
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
    * @param params.requestKwargs 
    * @param params.maxRetries 
    * @returns A Search object, yielding search results.
    */
    // TODO
    //public searchItems(query: string, params: IaSessionSearchItemsParams): IaSearch {
    //    return new IaSearch(this, query, params);
    //}

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

    public getTasksApiRateLimit(cmd: IaTaskType = 'derive.php'): Promise<any> {
        return new Catalog(this).getRateLimit(cmd);
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
        return new Catalog(this).submitTask({
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
     * @param requestKwargs Keyword arguments to be used in :meth:`requests.sessions.Session.get` request.
     * @returns An iterable of completed CatalogTasks.
     */
    public async *iterHistory(
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
        const c = new Catalog(this);
        return c.iterTasks(getTasksParams);
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
        const c = new Catalog(this);
        return c.iterTasks(getTasksParams);
    };

    /**
     * Get the total counts of catalog tasks meeting all criteria,
     * @param identifier Item identifier.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @param requestKwargs Keyword arguments to be used in :meth:`requests.sessions.Session.get` request.
     * @returns Counts of catalog tasks meeting all criteria.
     */
    public getTasksSummary(identifier: string = "", params?: IaGetTasksParams): any {
        return new Catalog(this).getSummary(identifier, params);
    }

    /**
     * Get a list of all tasks meeting all criteria.
     * The list is ordered by submission time.
     * @param getTaskParams params for the {@link Catalog.getTasks} method.
     * @returns A set of all tasks meeting all criteria.
     */
    public getTasks(getTaskParams: IaGetTasksParams): Promise<CatalogTask[]> {
        return new Catalog(this).getTasks(getTaskParams);
    }

    /**
     * Get all queued or running tasks.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An array of all queued or running tasks.
     */
    public getMyCatalog(params: Exclude<IaGetTasksParams, 'catalog' | 'summary' | 'history' | 'submitter'> = {}): Promise<CatalogTask[]> {
        params = Object.assign(params, {
            submitter: this.userEmail,
            catalog: 1,
            summary: 0,
            history: 0
        });
        return this.getTasks(params);
    }

    /**
     * Get a task this.log.
     * @param taskId The task id for the task log you'd like to fetch.
     * @returns The task log as a string.
     */
    public async getTaskLog(taskId: string | number): Promise<string> {
        return CatalogTask.getTaskLog(taskId, this);
    }

    //public send(request: Request): Promise<Response> {
    //    return fetch(request);
    //}
}

export default IaSession;


