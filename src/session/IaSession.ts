import IaCatalog from "../catalog/IaCatalog";
import IaCatalogTask from "../catalog/IaCatalogTask";
import { IaApiAuthenticationError, IaApiError, IaApiInvalidIdentifierError, IaApiItemNotFoundError, IaApiNotFoundError, IaApiUnauthorizedError, IaAuthenticationError, IaError, IaInvalidIdentifierError, IaTypeError } from "../error";
import IaCollection from "../item/IaCollection";
import { IaItem } from "../item/IaItem";
import log from "../log";
import { IaMetadataRequest } from "../request/IaMetadataRequest";
import {
    HttpHeaders,
    IaApiGetRateLimitResult,
    IaApiJsonErrorResult,
    IaAuthConfig,
    IaBaseMetadataType,
    IaCheckIdentifierResponse,
    IaFileBaseMetadata,
    IaGetFieldsResult,
    IaGetTasksBasicParams,
    IaGetTasksParams,
    IaHttpRequestDeleteParams,
    IaHttpRequestGetParams,
    IaHttpRequestPostParams,
    IaItemBaseMetadata,
    IaItemData,
    IaItemExtendedMetadata,
    IaRawMetadata,
    IaAdvancedSearchConstructorParams,
    IaTaskType,
    IaUserInfo,
    IaSubmitTaskParams,
    IaCheckLimitApiResult,
    IaTaskSummary
} from "../types";
import getUserAgent from "../util/getUserAgent";
import { handleIaApiError } from "../util/handleIaApiError";
import { createS3AuthHeader } from "../util/createS3AuthHeader";
import { IaAdvancedSearch } from "../search/IaAdvancedSearch";
import { IaLongViewcounts, IaShortViewcounts } from "../types/IaViewCount";
import { isApiJsonErrorResult } from "../util/isApiJsonErrorResult";
import { TODO } from "../todotype";
import { isValidIdentifier } from "../util/isValidIdentifier";

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
 * It is recommended to use an instance of this class to access 
 * Internet Archive API endpoints.
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
    public readonly accessKey?: string;
    public readonly secretKey?: string;
    public readonly auth?: HttpHeaders;
    protected readonly secure: boolean;
    protected readonly config: IaAuthConfig;
    protected readonly catalog: IaCatalog;
    public userEmail?: string;

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
        this.config = config;
        this.secure = this.config.general?.secure ?? true;
        this.host = this.config.general?.host ?? 'archive.org';
        this.protocol = this.secure ? 'https:' : 'http:';
        this.url = `${this.protocol}//${this.host}`;
        this.cookies = new ArchiveSessionCookies();
        this.catalog = new IaCatalog(this);

        // TODO manage cookies
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
        //this.headers['Connection'] = 'close';
    }

    /**
     * A method for creating an {@link IaItem} and {@link IaCollection} objects.
     * @param identifier A globally unique Archive.org identifier.
     * @param itemMetadata A metadata dict used to initialize the Item or Collection object. 
     *      Metadata will automatically be retrieved from Archive.org if nothing is provided.
     * @returns 
     */
    public async getItem<
        ItemMetaType extends IaBaseMetadataType = IaBaseMetadataType,
        ItemFileMetaType extends IaBaseMetadataType = IaBaseMetadataType
    >(identifier: string): Promise<IaItem<ItemMetaType, ItemFileMetaType> | IaCollection<ItemMetaType, ItemFileMetaType>> {
        const itemData = await this.getMetadata(identifier) as IaItemData<ItemMetaType, ItemFileMetaType>;
        const mediatype = itemData.metadata.mediatype;
        if (mediatype === "collection") {
            return new IaCollection(this, itemData);
        } else {
            return new IaItem(this, itemData);
        }
    }

    /**
     * Get an Item's metadata from the {@link http://blog.archive.org/2013/07/04/metadata-api/ | Metadata API}
     * @param identifier Globally unique Archive.org identifier.
     * @throws {IaApiError}
     * @throws {IaApiItemNotFoundError} If the item does not exist
     */
    public async getMetadata
        <ItemMetaType extends IaItemBaseMetadata = IaItemExtendedMetadata,
            ItemFileMetaType extends IaFileBaseMetadata | IaRawMetadata<IaFileBaseMetadata> = IaFileBaseMetadata>
        (identifier: string): Promise<IaItemData<ItemMetaType, ItemFileMetaType>> {
        return this.getJson<IaItemData<ItemMetaType, ItemFileMetaType>>(`${this.url}/metadata/${identifier}`)
            .then(json => {
                // The metadata endpoint returns status of 200 with a body of "{}" if the item does not exist.
                // We convert this into an error here
                if (Object.keys(json).length === 0) {
                    throw new IaApiItemNotFoundError(`Item "${identifier}" does not exist`);
                }
                return json;
            });
    }

    /**
     * Sends a GET request to the URL and expects a JSON response in return.
     * If the response has a non-200 status OR the response has an "error" field, an error gets thrown
     * @param url 
     * @param params 
     * @returns Promise that resolved with the JSON body
     * @typeParam T - Expected return type from a successful response
     * @throws {IaApiError} - {@link IaApiError} If response has a non-200 status or an `"error"` field.
     */
    public async getJson<T extends {}>(url: string, params: IaHttpRequestGetParams = {}): Promise<T> {
        const response = await this.get(url, params);
        if (!response.headers.get('content-type')?.startsWith('application/json')) {
            throw new IaApiError(`Content type of response is expected to be application/json, actual type is "${response.headers.get('content-type')}"`, { response });
        }
        const json = await response.json() as T | IaApiJsonErrorResult;
        if (!response.ok || isApiJsonErrorResult(json)) {
            throw await handleIaApiError({ response, responseBody: json });
        }
        return json as T;
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

        console.log(`POST ${urlObj.href}`);
        console.log(body);
        console.log({ ...this.headers, ...headers, ...contentTypeHeader, ...(auth ?? this.auth) });
        return fetch(urlObj.href, {
            method: "POST",
            headers: { ...this.headers, ...headers, ...contentTypeHeader, ...(auth ?? this.auth) },
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

    /**
     * Send a HTTP request. This method does not perform any error handling currently.
     * @param request Request to send
     * @returns Response
     */
    public async send(request: Request): Promise<Response> {
        return fetch(request);
    }

    /**
    * Search for items on Archive.org using the {@link https://archive.org/advancedsearch.php|Advanced search API}
    * @param query The Archive.org search query to yield results for. Refer to {@link https://archive.org/advancedsearch.php#raw} for help formatting your query.
    * @param params
    * @param params.fields Fields to include in the results. If not supplied, a standard set of fields will be returned.
    *        Regardless of which fields are supplied, the `"identifier"` field will always be included.
    * @param params.sorts Up to 3 sort options
    * @param params.scope Scope `"standard"` or `"all"` (default: `"standard"`)
    * @param params.rows Number of items to return per API query (default: `100`)
    * @param params.limit Maximum number of retries for each API call (default: `5`)
    * @returns A Search object, yielding search results.
    */
    public searchAdvanced<F extends string[] | undefined>(query: string, params: IaAdvancedSearchConstructorParams<F>): IaAdvancedSearch<F> {
        return new IaAdvancedSearch(this, query, params);
    }

    /**
     * 
     * @param identifier 
     * @param accessKey 
     * @returns 
     */
    public async s3IsOverloaded(identifier?: string, accessKey?: string): Promise<boolean> {
        try {
            const response = await this.checkLimits(identifier, accessKey);
            return response.over_limit != 0;
        } catch (err) {
            // If API returns an error, assume S3 is overloaded
            return true;
        }
    }

    /**
     * Check S3 limits
     * @param identifier Optional identifier 
     * @param accessKey Optional access key
     * @returns API Limits response
     * @throws {IaApiError}
     */
    public async checkLimits(identifier?: string, accessKey?: string): Promise<IaCheckLimitApiResult> {
        const url = `${this.protocol}//s3.us.${this.host}`;
        const params = {
            check_limit: '1',
            bucket: identifier,
            accessKey,
        };
        return this.getJson<IaCheckLimitApiResult>(url, { params });
    }

    /**
     * Returns rate limit for specified task type
     * @param cmd Task type
     * @returns Rate limit object
     * @throws {IaApiError}
     */
    public getTasksApiRateLimit<T extends IaTaskType>(cmd: IaTaskType = 'derive.php'): Promise<IaApiGetRateLimitResult<T>> {
        return this.catalog.getRateLimit(cmd);
    };

    /**
     * Submit a task
     * @param identifier Item identifier.
     * @param cmd Task command to submit, see {@link https://archive.org/services/docs/api/tasks.html#supported-tasks | supported task commands}
     * @param param2.comment A reasonable explanation for why the task is being submitted.
     * @param param2.priority Task priority from 10 to -10 (default: 0).
     * @param param2.data Extra POST data to submit with the request. Refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API}.
     * @param param2.headers Add additional headers to request.
     * @param param2.reducedPriority Submit your derive at a lower priority.
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
        {
            comment,
            priority,
            data,
            headers = {},
            reducedPriority
        }: Omit<IaSubmitTaskParams, 'identifier' | 'cmd'> & { reducedPriority?: boolean; }): Promise<Response> {
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
    };

    /**
     * A generator that returns completed tasks.
     * @param identifier Item identifier.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An iterable of completed CatalogTasks.
     */
    public iterTaskHistory(
        identifier: string,
        params: IaGetTasksBasicParams = {}
    ): AsyncGenerator<IaCatalogTask> {
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
    public async * iterCatalogTasks(
        identifier?: string,
        params: IaGetTasksBasicParams = {}
    ): AsyncGenerator<IaCatalogTask> {
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
    public getTasksSummary(identifier: string = "", params?: IaGetTasksBasicParams): Promise<IaTaskSummary> {
        return this.catalog.getSummary(identifier, params);
    }

    /**
     * Get a list of all tasks meeting all criteria.
     * The list is ordered by submission time.
     * @param getTaskParams params
     * @returns A set of all tasks meeting all criteria.
     */
    public getTasks(getTaskParams: Omit<IaGetTasksParams, 'limit' | 'summary'>): Promise<IaCatalogTask[]> {
        return this.catalog.getTasks(getTaskParams);
    };

    /**
     * Get all queued or running tasks.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An array of all queued or running tasks.
     */
    public async getMyCatalogTasks(params: Exclude<IaGetTasksParams, 'catalog' | 'summary' | 'history' | 'submitter'> = {}): Promise<IaCatalogTask[]> {
        const userEmail = await this.getUserEmail();
        return this.getTasks({
            ...params,
            submitter: userEmail,
            catalog: 1,
            history: 0
        });
    };

    /**
     * Get user info
     * @returns User info for currently logged in user
     * @throws {IaApiAuthenticationError}
     */
    public async getUserInfo(): Promise<IaUserInfo> {
        if (this.accessKey && this.secretKey) {
            return this.getJson<IaUserInfo>(`https://s3.us.${this.host}`, { params: { check_auth: '1' } });
        } else {
            throw new IaApiAuthenticationError("Need auth for this method");
        }
    }

    /**
     * Get e-mail address of the logged in user of this session
     * @returns e-mail address
     * @throws {IaApiAuthenticationError}
     */
    public async getUserEmail(): Promise<string> {
        if (!this.userEmail) {
            this.userEmail = (await this.getUserInfo()).username;
        }
        return this.userEmail;
    }

    /**
     * Get a task log.
     * @param taskId The task id for the task log you'd like to fetch.
     * @returns The task log as a string.
     */
    public async getTaskLog(taskId: number): Promise<string> {
        return IaCatalogTask.getTaskLog(taskId, this);
    };

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

    // TODO is this endpoint still maintained?
    /**
     * Returns requestable fields from the endpoint `/services/search/v1/fields`.
     * 
     * This endpoint requires no authorization.
     * 
     * @see {@link https://web.archive.org/web/20230327211907/https://archive.org/services/swagger/?url=%2Fservices%2Fsearch%2Fv1%2Fswagger.yaml#!/meta/get_fields}
     * @returns list of fields that can be requested
     * @throws {IaApiScopeUnavailableError} If scope is now available to the current user
     * @throws {IaApiError}
     */
    public async getRequestableFields(): Promise<string[]> {
        const url = `${this.url}/services/search/v1/fields`;
        const response = await this.get(url);
        const json = await response.json() as IaGetFieldsResult | IaApiJsonErrorResult;
        if (!response.ok || isApiJsonErrorResult(json)) {
            throw await handleIaApiError({ response, responseBody: json });
        }
        return json.fields;
    }

    /**
     * Get list of short view counts for the supplied list of identifiers
     * If an identifier does not exist, this function will not fail, but the
     * `have_data` attribute of the corresponding item will be set to `false`.
     * 
     * @see {@link https://archive.org/developers/views_api.html#simple-summary-view-count-data}
     * 
     * @param identifiers Identifiers to get view counts for
     * @returns View counts object
     * @throws {IaApiUnauthorizedError}
     * @throws {IaApiError}
    */
    public getShortViewcounts<T extends readonly string[]>(identifiers: T): Promise<IaShortViewcounts<T[number]>> {
        return this.getJson(`${this.protocol}//be-api.us.${this.host}/views/v1/short/${identifiers.map(encodeURIComponent).join(',')}`)
    };
    
    /**
     * Get list of detailed view counts for the supplied list of identifiers
     * If an identifier does not exist, this function will not fail, but the
     * `have_data` attribute of the corresponding item will be set to `false`.
     * 
     * This API call provides data suitable for making item sparclines, and very general summary reporting.
     * 
     * @see {@link https://archive.org/developers/views_api.html#per-day-view-data}
     * 
     * @param identifiers Identifiers to get view counts for
     * @returns Detailed View counts object
     * @throws {IaApiUnauthorizedError}
     * @throws {IaApiError}
    */
    public getLongViewcounts<T extends readonly string[]>(identifiers: T): Promise<IaLongViewcounts<T[number]>> {
        return this.getJson(`${this.protocol}//be-api.us.${this.host}/views/v1/long/${identifiers.map(encodeURIComponent).join(',')}`)
    };

    /**
     * Create a new Item with the supplied metadata and files
     * @param identifier Unique identifier for this item 
     * @param metadata 
     * @param files 
     */
    public createItem<MetadataType extends IaBaseMetadataType = IaBaseMetadataType>(identifier: string, metadata: MetadataType, files: TODO): Promise<IaItem<MetadataType>> {
        if (!isValidIdentifier(identifier)) {
            throw new IaInvalidIdentifierError(`Not a valid identifier: "${identifier}"`);
        }
        // TODO implement

        throw new Error("Not implemented");
    }
}

export default IaSession;