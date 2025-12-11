import { Prettify } from "../types/index.js";

export type WaybackUserStatusResponse = {
    available: number,
    processing: number;
    daily_captures: number,
    daily_captures_limit: number;
};

export type WaybackSystemStatusResponse = {
    recent_captures: number,
    status: string;
    queues: {
        'spn2-captures': number,
        'spn2-captures-misc': number,
        'spn2-outlinks': number,
        'spn2-outlinks-misc': number,
        'spn2-api': number,
        'spn2-api-misc': number,
        'spn2-api-outlinks': number,
        'spn2-api-outlinks-misc': number,
        'spn2-high-fidelity': number,
        'spn2-vip': number,
        'spn2-vip-outlinks': number,
        'spn2-screenshots': number;
    };
};

export type WaybackSavePageResult = {
    url: string,
    job_id: string,
    //status: string,
    //status_ext: string,
    //message: string;
};


export type WaybackJobStatusResponse = {
    status: "success",
    job_id: string,
    original_url: string,
    screenshot?: string;
    timestamp: string,
    duration_sec: number,
    resources: string[],
    outlinks: Record<string, string> | Record<string, { timestamp: string | null; }>;
} | {
    status: "pending",
    job_id: string,
    resources: string[],
} | {
    status: "error",
    exception: string,
    status_ext: StatusExt;
    job_id: string,
    message: string,
    resources: [];
};

export const WaybackErrorMapping = {
    "error:bad-gateway": "Bad Gateway for URL (HTTP status=502).",
    "error:bad-request": "The server could not understand the request due to invalid syntax. (HTTP status=401)",
    "error:bandwidth-limit-exceeded": "The target server has exceeded the bandwidth specified by the server administrator. (HTTP status=509).",
    "error:blocked": "The target site is blocking us (HTTP status=999).",
    "error:blocked-client-ip": "Anonymous clients which are listed in https://www.spamhaus.org/xbl/ or https://www.spamhaus.org/sbl/ lists (spams & exploits) are blocked. Tor exit nodes are excluded from this filter.",
    "error:blocked-url": "We use a URL block list based on Mozilla web tracker lists to avoid unwanted captures.",
    "error:browsing-timeout": "SPN2 back-end headless browser timeout.",
    "error:capture-location-error": "SPN2 back-end cannot find the created capture location. (system error).",
    "error:cannot-fetch": "Cannot fetch the target URL due to system overload.",
    "error:celery": "Cannot start capture task.",
    "error:filesize-limit": "Cannot capture web resources over 2GB.",
    "error:ftp-access-denied": "Tried to capture an FTP resource but access was denied.",
    "error:gateway-timeout": "The target server didn't respond in time. (HTTP status=504).",
    "error:http-version-not-supported": "The target server does not support the HTTP protocol version used in the request for URL (HTTP status=505).",
    "error:internal-server-error": "SPN internal server error.",
    "error:invalid-url-syntax": "Target URL syntax is not valid.",
    "error:invalid-server-response": "The target server response was invalid. (e.g. invalid headers, invalid content encoding, etc).",
    "error:invalid-host-resolution": "Couldn’t resolve the target host.",
    "error:job-failed": "Capture failed due to system error.",
    "error:method-not-allowed": "The request method is known by the server but has been disabled and cannot be used (HTTP status=405).",
    "error:not-implemented": "The request method is not supported by the server and cannot be handled (HTTP status=501).",
    "error:no-browsers-available": "SPN2 back-end headless browser cannot run.",
    "error:network-authentication-required": "The client needs to authenticate to gain network access to the URL (HTTP status=511).",
    "error:no-access": "Target URL could not be accessed (status=403).",
    "error:not-found": "Target URL not found (status=404).",
    "error:proxy-error": "SPN2 back-end proxy error.",
    "error:protocol-error": "HTTP connection broken. (A possible cause of this error is \"IncompleteRead\").",
    "error:read-timeout": "HTTP connection read timeout.",
    "error:soft-time-limit-exceeded": "Capture duration exceeded 45s time limit and was terminated.",
    "error:service-unavailable": "Service unavailable for URL (HTTP status=503).",
    "error:too-many-daily-captures": "This URL has been captured 10 times today. We cannot make any more captures.",
    "error:too-many-redirects": "Too many redirects. SPN2 tries to follow 3 redirects automatically.",
    "error:too-many-requests": "The target host has received too many requests from SPN and it is blocking it. (HTTP status=429).",
    "error:user-session-limit": "User has reached the limit of concurrent active capture sessions.",
    "error:unauthorized": "The server requires authentication (HTTP status=401).",
} as const;

export type StatusExt = keyof typeof WaybackErrorMapping;


export type WaybackSaveOptions = {
    /** 
     * Capture a web page with errors (HTTP status=4xx or 5xx). By default SPN2 captures only status=200 URLs. 
     * @default false
    */
    captureAll?: boolean;

    /** 
     * Capture web page outlinks automatically. This also applies to PDF, JSON, RSS and MRSS feeds. 
     * @default false
    */
    captureOutlinks?: boolean;

    /** 
     * Capture full page screenshot in PNG format. This is also stored in the Wayback Machine as a different capture. 
     * @default false
    */
    captureScreenshot?: boolean;

    /** 
     * The capture becomes available in the Wayback Machine after ~12 hours instead of immediately.
     * This option helps reduce the load on our systems. All API responses remain exactly the same when using this option. 
     * @default false
    */
    delayWbAvailability?: boolean;

    /** 
     * Force the use of a simple HTTP GET request to capture the target URL.
     * By default SPN2 does a HTTP HEAD on the target URL to decide whether to 
     * use a headless browser or a simple HTTP GET request. 
     */
    forceGet?: boolean;

    /** 
     * Skip checking if a capture is a first if you don’t need this information.
     * This will make captures run faster. 
     * @default false
    */
    skipFirstArchive?: boolean;

    /** 
     * Capture web page only if the latest existing capture at the Archive is older than the <timedelta> limit. 
     * Its format could be any datetime expression like \"3d 5h 20m” or \"ust a number of seconds, e.g. \"120”. 
     * \"f there is a capture within the defined timedelta, SPN2 returns that as a recent capture. The default system <timedelta> is 45 min.
     * When using 2 <timedelta> values, the first one applies to the main capture and the second one applies to outlinks.
     */
    ifNotArchivedWithin?: string | [string, string];

    /** 
     * Return the timestamp of the last capture for all outlinks. 
     * @default false
    */
    outlinksAvailability?: boolean;

    /** 
     * Send an email report of the captured URLs to the user’s email. 
     * @default false
    */
    emailResult?: boolean;

    /**
     * Run JS code for <N> seconds after page load to trigger target page functionality like image loading on mouse over, scroll down to load more content, etc. The default system <N> is 5 sec. 
     * More details on the JS code we execute: https://github.com/internetarchive/brozzler/blob/master/brozzler/behaviors.yaml
     * WARNING: The max <N> value that applies is 30 sec.
     * NOTE: If the target page doesn’t have any JS you need to run, you can use js_behavior_timeout=0 to speed up the capture.
     * @default 5;
     */
    jsBehaviorTimeout?: number;

    /** Use extra HTTP Cookie value when capturing the target page. */
    captureCookie?: string;

    /** Use custom HTTP User-Agent value when capturing the target page.  */
    useUserAgent?: string;
} & ({
    targetUsername?: undefined;
    targetPassword?: undefined;
} | {
    /** Use your own username and password in the target page’s login forms. */
    targetUsername: string;
    targetPassword: string;
});



/** All possible fields that can be returned by the WayBack CDX API */
export const WAYBACK_CDX_FIELDS = [
    "urlkey",
    "timestamp",
    "original",
    "mimetype",
    "statuscode",
    "digest",
    "length",
] as const;

// TODO add handler for https://archive.org/help/wayback_api.php

export type WaybackAvailabilityData = {
    available: boolean,
    url: string,
    timestamp: string,
    status: string;
};

export type WaybackGetAvailabilityResponse = {
    archived_snapshots: {
        closest?: WaybackAvailabilityData;
    };
};



export type WaybackCdxCollapseOption = WaybackCdxField | `${WaybackCdxField}:${number}`;

export type WaybackSnapshotInfo = {
    /** A canonical transformation of the URL you supplied, for example, org,eserver,tc)/. Such keys are useful for indexing. */
    urlkey: string;
    /** A 14 digit date-time representation in the YYYYMMDDhhmmss format. */
    timestamp: string;
    /** The originally archived URL, which could be different from the URL you supplied. */
    original: string;
    /** The mimetype of the archived content, which can be one of these: 
     * - `"text/html"`
     * - `"warc/revisit"`
    */
    mimetype: string;
    /** The HTTP status code of the snapshot. If the mimetype is warc/revisit, the value returned for the statuscode key can be blank, but the actual value is the same as that of any other entry that has the same digest as this entry. */
    statuscode: string;
    /** The SHA1 hash digest of the content, excluding the headers. It's usually a base-32-encoded string. */
    digest: string;
    /** The compressed byte size of the corresponding WARC record, which includes WARC headers, HTTP headers, and content payload. */
    length: number;
};

export type WaybackSnapshotOptionalFields = {
    /** shows duplicates */
    dupecount: string;
};

export type WaybackSnapshotResponse<F extends WaybackCdxField[] | undefined, O extends WaybackCdxOptions<F> = WaybackCdxOptions<F>> = Prettify<
    (F extends WaybackCdxField[] ? Pick<WaybackSnapshotInfo, F[number]> : WaybackSnapshotInfo) &
    (O extends { showDupeCount: true; } ? Pick<WaybackSnapshotOptionalFields, "dupecount"> : {})>;

export type WaybackCdxField = Prettify<keyof WaybackSnapshotInfo>;

export type WaybackCdxFilter = `${"!" | ""}${WaybackCdxField}:${string}`;

export type WaybackCdxOptions<T extends WaybackCdxField[] | undefined> = {
    /**
     * @default "exact"
     */
    matchType?: WaybackCdxMatchType;
    /**
     * Return the first n results. Use -N to return the last n results
     * 
     * @example 10 // return the first 10 results.
     * @example -10 // return the last 10 results. The query may be slow as it begins reading from the beginning of the search space and skips all but last N results.
     * 
     * @see {@link https://archive.org/developers/wayback-cdx-server.html#query-result-limits}
     */
    limit?: number;
    /**
     * The offset= M param can be used in conjunction with limit to skip the first M records. This allows for a simple way to scroll through the results.
     * However, the offset/limit model does not scale well to large querties since the CDX server must read and skip through the number of results specified by offset, so the CDX server begins reading at the beginning every time.
     * @see {@link https://archive.org/developers/wayback-cdx-server.html#query-result-limits}
     */
    offset?: number;
    /**
     * Advanced Option: Return some number of latest results for an exact match.
     * This option and is faster than the standard last results search. 
     * The number of results is at least 1 so limit=-1 implies this setting.
     * The number of results may be greater >1 when a secondary index format
     * (such as ZipNum) is used, but is not guaranteed to return any more 
     * than 1 result. Combining this setting with limit= will ensure that 
     * no more than N last results.
     * @see {@link https://archive.org/developers/wayback-cdx-server.html#query-result-limits}
     */
    fastLatest?: true;
    /**
     * Filter by date. If defined, query will return items from the specified date NS later.
     * Can be either a Date object or a 14-digit archive timestamp in the format yyyyMMddhhmmss
     */
    from?: string | Date;
    /**
     * Filter by date. If defined, query will return items up until the specified date.
     * Can be either a Date object or a 14-digit archive timestamp in the format yyyyMMddhhmmss
     */
    to?: string | Date;
    /**
     * It is possible to filter on a specific field or the entire CDX line (which is space delimited). Filtering by specific field is often simpler. Any number of filter params of the following form may be specified: filter=[!]field:regex may be specified.
     * Optional: `!` before the query inverts the match, that is, will return results that do NOT match the regex.
     * 
     * @example
     * "!statuscode:200" // Returns all items with a statuscode that is not 200
     * 
     * @see {@link https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server#filtering}
     */
    filter?: WaybackCdxFilter | WaybackCdxFilter[];
    /**
     * It is possible to track how many CDX lines were skipped due to Filtering
     * and Collapsing by adding the special skipcount counter with
     * `showSkipCount = true`.
     * 
     * An optional endtimestamp count can also be used to print the timestamp
     * of the last capture by adding lastSkipTimestamp=true
     * @see {@link https://archive.org/developers/wayback-cdx-server.html#duplicate-counter}
     */
    showDupeCount?: true;
    /**
     * 
     */
    showSkipCount?: true;
    lastSkipTimestamp?: true;
    /**
     * List of fields to return, must be of type {@link WaybackCdxField}
     * 
     * If not defined, all fields are returned.
     */
    fl?: T;
    /**
     * Page number
     * If pagination is not supported, the CDX server will return a 400.
     * @see {@link https://archive.org/developers/wayback-cdx-server.html#pagination-api}
     */
    page?: number;
    /**
     * It is possible to adjust the page size to a smaller value than the 
     * default by setting the pageSize=P where 1 <= P <= default page size.
     */
    pageSize?: number;
    /**
     * To determine the number of pages, add the showNumPages=true param. 
     * This is a special query that will return a single number indicating the number of pages
     */
    showNumPages?: boolean;
    /**
     * It is also possible to have the CDX server return the raw secondary index, by specifying showPagedIndex=true. 
     * This query returns the secondary index instead of the CDX results and may be subject to access restrictions.
     */
    showPagedIndex?: true;
    /**
     * Collapses the results based on the field contents or substring of the field content.
     * Add one or more collapse items by either specifying the field name or <fieldname>:N where N
     * is a positive integer and specifies that the first N characters of the field value are used for collapsing
     * @see {@link https://archive.org/developers/wayback-cdx-server.html#collapsing|Collapsing}
     */
    collapse?: WaybackCdxCollapseOption | WaybackCdxCollapseOption[];
    /**
     * Show resume Key
     */
    showResumeKey?: boolean;
    /**
     * Resume key
     */
    resumeKey?: string;

    // TODO Undocumented
    /**
     * Sort type
     */
    sort?: "regular" | "reverse" | "closest";
};

export type WaybackCdxOptionsWithoutResume<T extends WaybackCdxField[] | undefined> = Prettify<Omit<WaybackCdxOptions<T>, 'showResume'> & { showResumeKey?: false; }>;
export type WaybackCdxOptionsWithResume<T extends WaybackCdxField[] | undefined> = Prettify<Omit<WaybackCdxOptions<T>, 'showResume'> & { showResumeKey: true; }>;

/**
 * `"exact"` (default if omitted) will return results matching exactly the domain
 * 
 * `"prefix"` will return results for all results under the given path
 * 
 * `"host"` will return results from same host
 * 
 * `"domain"` will return results from host archive.org and all subhosts, e.g. *.archive.org;
 */
export type WaybackCdxMatchType = "exact" | "prefix" | "host" | "domain";

// TODO 
export type WaybackSnapshotMimeType = "text/html" | "warc/revisit" | string & {};