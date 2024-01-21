import { HttpHeaders, HttpParams, IaRequestTarget } from ".";
import { IaAuthConfig, IaQueryOutput } from "../IaTypes";
import { AuthBase } from "../auth/AuthBase";
import ArchiveSession from "../session/ArchiveSession";
import { HttpMethod } from "./HttpMethod";
import { Mapping, MutableMapping, dict } from "./pythontypes";


export type IaDebugParams = {
    /** Enable debug behaviour for function */
    debug?: boolean;
};

export type IaSessionParams = {
    /** IA-S3 accessKey to use when making the given request. */
    accessKey: string;
    /** IA-S3 secretKey to use when making the given request. */
    secretKey: string;
} | {
    accessKey?: undefined;
    secretKey?: undefined;
};

export type IaGetSessionParams = {
    /** Optional archiveSession object. If not defined, one will be created internally */
    archiveSession?: ArchiveSession,
    /** Configuration */
    config?: Mapping,
    /** Path to config file */
    configFile?: string,
};

// getItem

export type IaGetItemParams = IaDebugParams & IaGetSessionParams;

export type DebugEnabled<T extends IaDebugParams> = Omit<T, 'debug'> & { debug: true; };
export type DebugDisabled<T extends IaDebugParams> = Omit<T, 'debug'> & { debug?: false; };
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

export type IaGetFilesParams = IaItemGetFilesParams & IaGetItemParams;


// Delete Item

// Delete File

export type IaFileDeleteParams = {
    cascadeDelete?: any;
    verbose: boolean;
    debug: boolean;
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
    headers?: Mapping,
    insert?: boolean,
    priority: number,
    requestKwargs?: Mapping,
    target?: IaRequestTarget,
    timeout?: number;
} & IaSessionParams & IaDebugParams;

export type IaModifyMetadataParams = IaItemModifyMetadataParams & IaGetItemParams;

// Upload

export type IaItemUploadParams = {
    metadata?: Mapping,
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
    requestKwargs?: MutableMapping;
} & IaSessionParams;

export type IaUploadParams = IaItemUploadParams & IaGetItemParams;

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
    timeout?: number | [number, number];
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
    fileobj?: NodeJS.WritableStream;
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

// TODO fields optional
export type IaSessionSearchItemsParams = {
    fields: string[],
    sorts?: string[],
    params?: Partial<IaSearchParams>,
    fullTextSearch?: boolean,
    dslFts?: boolean,
    maxRetries?: number;
};

export type MountHttpAdapterParams = {
    protocol?: string,
    maxRetries?: number,
    statusForcelist?: number[],
    host?: string,
};


export type IaSearchItemsParams = IaSessionSearchItemsParams & IaGetSessionParams;


export type IaSearchParams = {
    q: string,
    index?: string,
    scope?: string,
    count?: number,
    size?: number,
    from?: number,
    scroll_id?: string,
    total_only?: boolean,
    // TODO
    user_aggs?: any;
    cursor?: string,
    scroll?: boolean,
    page?: number,
    rows?: number,
    output?: IaQueryOutput,
    fields?: string,
    sorts?: string,
    [key: `sort[${number | string}]`]: string,
    [key: `fl[${number | string}]`]: string,
};



export type S3RequestConstructorParams = {
    metadata?: any,
    fileMetadata?: any,
    queueDerive?: any,
} & IaSessionParams;
