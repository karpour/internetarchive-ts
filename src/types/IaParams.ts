import { HttpHeaders, HttpMethod, HttpParams, IaAuthConfig, IaBaseMetadataType, IaFileBaseMetadata, IaFileRequestTarget, IaFilesXmlMetadata, IaItemData, IaMultiMetadata, IaQueryOutput, IaRequestTarget, IaSortOption, IaTaskPriority, IaTaskType, Prettify } from ".";
import IaSession from "../session/IaSession";

export type IaSessionParams = {
    /** IA-S3 accessKey to use when making the given request. */
    accessKey: string;
    /** IA-S3 secretKey to use when making the given request. */
    secretKey: string;
}; /*| {
    accessKey?: undefined;
    secretKey?: undefined;
};*/

export type IaGetSessionParams = {
    /** Optional archiveSession object. If not defined, one will be created internally */
    archiveSession?: IaSession,
    /** Configuration */
    config?: IaAuthConfig;
};


// getFiles
export type IaItemGetFilesParams = {
    /** Only return files matching the given filenames */
    files?: string | string[],
    /** Only return files matching the given formats */
    formats?: string | string[],
    /** Only return files matching the given glob pattern */
    globPattern?: string | string[],
    /** Exclude files matching the given glob pattern */
    excludePattern?: string | string[],
    /** Include on-the-fly files (i.e. derivative EPUB) */
    onTheFly?: boolean;
};

export type IaGetFilesParams = IaItemGetFilesParams & IaGetSessionParams;


// Delete Item

// Delete File

export type IaFileDeleteParams = {
    cascadeDelete?: any;
    verbose: boolean;
    maxRetries?: number;
    headers?: HttpHeaders;
} & IaSessionParams;

export type IaDeleteItemParams = IaFileDeleteParams & IaGetFilesParams;


export type MetadataRequestConstructorParams = {
    append?: any,
    appendList?: any,
    headers?: HttpHeaders;
    insert?: boolean,
    kwargs: any;
    metadata?: any,
    method: HttpMethod;
    priority?: any,
    sourceMetadata?: any,
    target?: any,
} & IaSessionParams;

export type IaItemModifyMetadataParams = {
    append: boolean,
    appendList: boolean,
    headers?: HttpHeaders,
    insert?: boolean,
    priority: IaTaskPriority,
    target?: IaRequestTarget,
    timeout?: number;
} & IaSessionParams;

export type IaModifyMetadataParams = IaItemModifyMetadataParams & IaGetSessionParams;

//Request

export type IaHttpRequestParams = {
    params?: Record<string, string | number | boolean | undefined>,
    auth?: HttpHeaders,
    headers?: HttpHeaders;
    timeout?: number;
};

export type IaHttpRequestGetParams = Prettify<IaHttpRequestParams & { stream?: boolean; }>;
export type IaHttpRequestPostParams = IaHttpRequestParams & ({ body?: BodyInit; json?: undefined; } | { body?: undefined; json: Record<string, any>; });
export type IaHttpRequestDeleteParams = IaHttpRequestPostParams;

// Upload

export type IaItemUploadParams<M extends IaBaseMetadataType = IaBaseMetadataType> = Prettify<{
    metadata?: M,
    headers?: HttpHeaders,
    queueDerive: boolean,
    verbose: boolean,
    verify: boolean,
    checksum: boolean,
    deleteLocalFiles: boolean,
    retries?: number,
    retriesSleep?: number,
    debug: boolean,
    validateIdentifier: boolean,
} & IaSessionParams>;

export type IaItemUploadFileParams<M extends IaBaseMetadataType = IaBaseMetadataType, F extends IaFileBaseMetadata = IaFileBaseMetadata> = Prettify<IaItemUploadParams<M> & {
    key: string,
    fileMetadata: F;
    deleteLocalFiles: boolean;
}>;

export type IaUploadParams<M extends IaBaseMetadataType = IaBaseMetadataType> = IaItemUploadParams<M> & IaGetSessionParams;

// Download

export type IaItemDownloadParams = {
    files?: string | string[],
    formats?: string | string[],
    globPattern?: string,
    excludePattern?: string,
    dryRun?: boolean,
    verbose?: boolean,
    ignoreExisting?: boolean,
    checksum?: boolean,
    destdir?: string,
    noDirectory?: boolean,
    retries?: number,
    itemIndex?: number,
    ignoreErrors?: boolean,
    onTheFly?: boolean,
    returnResponses?: boolean,
    noChangeTimestamp?: boolean,
    ignoreHistoryDir?: boolean,
    source?: string | string[],
    excludeSource?: string | string[],
    stdout?: boolean,
    params?: HttpParams,
    timeout?: number;
};

// Download

export type IaFileDownloadParams = {
    /** Turn on verbose output. */
    verbose: boolean;
    /** Overwrite local files if they already exist. */
    ignoreExisting: boolean;
    /** Skip downloading file based on checksum. */
    checksum: boolean;
    /** The directory to download files to. */
    destdir?: any;
    /** The number of times to retry on failed requests. */
    retries: number;
    /** Don't fail if a single file fails to download, continue to download other files. */
    ignoreErrors: boolean;
    /** Write data to the given file-like object (e.g. sys.stdout). */
    fileobj?: WritableStream;
    /** Rather than downloading files to disk, return a list of response objects. */
    returnResponses: boolean;
    /** If True, leave the time stamp as the current time instead of changing it to that given in the original archive. */
    noChangeTimestamp: boolean;
    /** URL parameters to send with download request (e.g. `cnt=0`). */
    params?: HttpParams;
    /** */
    chunkSize?: number;
    /** Print contents of file to stdout instead of downloading to file. */
    stdout: boolean;
    /** (optional) Append a newline or `$ORS` to the end of file. This is mainly intended to be used internally with `stdout`. */
    ors?: boolean;
    /**  */
    timeout: number;
};




export type S3RequestConstructorParams = Prettify<{
    metadata?: IaBaseMetadataType,
    fileMetadata?: IaBaseMetadataType,
    queueDerive?: boolean,
} & IaRequestConstructorParams>;

export type IaRequestConstructorParams = Prettify<{
    /** Method */
    method: HttpMethod;
    /** A Headers object */
    headers?: Record<string, string>;
    files?: string[];
    params?: Record<string, string>;
    cookies?: Record<string, string>;
    hooks?: any;
    auth?: HttpHeaders;
    /** Accept a compressed response
     * @default true
     */
    compression?: boolean;
} & Omit<RequestInit, 'method' | 'headers'>>;

/**
 * Params for the {@link Catalog.submitTask} method
 */
export type IaSubmitTaskParams = {
    /** Identifier */
    identifier: string,
    /** Task command to submit. See {@link https://archive.org/services/docs/api/tasks.html#supported-tasks | Supported task commands} */
    cmd: IaTaskType,
    /** A reasonable explanation for why the task is being submitted */
    comment?: string,
    /** Task priority from 10 to -10 */
    priority: IaTaskPriority,
    /** Extra POST data to submit with the request. 
     * Refer to {@link https://archive.org/services/docs/api/tasks.html#request-entity | Tasks API Request Entity} */
    data?: Record<string, any>,
    /** Additional headers to add to the request */
    headers?: HttpHeaders;
};

export type IaMetadataRequestPrepareBodyParams = {
    metadata: IaMultiMetadata | IaBaseMetadataType,
    sourceMetadata: IaItemData,
    target?: IaRequestTarget,
    priority: IaTaskPriority,
    append: boolean,
    appendList: boolean,
    insert: boolean;
};

export type IaPreparePatchParams = {
    metadata: Readonly<IaBaseMetadataType>,
    sourceMetadata: Readonly<IaBaseMetadataType>,
    append: boolean,
    appendList?: boolean,
    insert?: boolean;
};

export type IaPrepareFilesPatchParams = {
    metadata: Readonly<IaBaseMetadataType>,
    sourceFilesMetadata: Readonly<(IaFileBaseMetadata | IaFilesXmlMetadata)[]>,
    append: boolean,
    appendList?: boolean,
    insert?: boolean;
    target: IaFileRequestTarget;
};



export type IaMetadataRequestConstructorParams =
    Prettify<IaMetadataRequestPrepareBodyParams & Omit<IaRequestConstructorParams, 'method'>>;
