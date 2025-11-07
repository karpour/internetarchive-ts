/**
 * This file implements functions to access the beta Wayback CDX Server API
 * @see https://archive.org/developers/wayback-cdx-server.html
 */

import { IaTypeError } from "../error";
import log from "../log";
import { Prettify } from "../types";
import { dateToYYYYMMDDHHMMSS } from "../util/dateToYYYYMMDDHHMMSS";
import { ArrayOfArraysWithHeaderRow, convertArrayOfArraysWithHeaderRow } from "./convertArrayOfArraysWithHeaderRow";

const WAYBACK_CDX_API_URL = "http://web.archive.org/cdx/search/cdx";
const WAYBACK_API_URL = "https://web.archive.org";


/**
 * Save a page to the Wayback Machine
 * @param url URL of the page to save
 * @param options
 * @param options.captureAll
 * @param options.captureOutlinks
 * @param options.captureScreenshot
 * @param options.delayWbAvailability
 * @param options.forceGet
 * @param options.skipFirstArchive
 * @param options.ifNotArchivedWithin
 * @param options.outlinksAvailability
 * @param options.emailResult
 * @param options.jsBehaviorTimeout
 * @param options.captureCookie
 * @param options.use_user_agent
 * @param options.targetUsername
 * @param options.targetPassword
 */
export async function save(url: string, options: WaybackSaveOptions = {}): Promise<WaybackSavePageResult> {
    const urlSearchParams: URLSearchParams = new URLSearchParams({ url });
    if (options.captureAll) urlSearchParams.append("capture_all", "1");
    if (options.captureOutlinks) urlSearchParams.append("capture_outlinks", "1");
    if (options.captureScreenshot) urlSearchParams.append("capture_screenshot", "1");
    if (options.delayWbAvailability) urlSearchParams.append("delay_wb_availability", "1");
    if (options.forceGet) urlSearchParams.append("force_get", "1");
    if (options.skipFirstArchive) urlSearchParams.append("skip_first_archive", "1");
    if (options.ifNotArchivedWithin) {
        if (Array.isArray(options.ifNotArchivedWithin)) {
            urlSearchParams.append("if_not_archived_within", options.ifNotArchivedWithin.join(','));
        } else {
            urlSearchParams.append("if_not_archived_within", options.ifNotArchivedWithin);
        }
    }
    if (options.outlinksAvailability) urlSearchParams.append("outlinks_availability", "1");
    if (options.emailResult) urlSearchParams.append("email_result", "1");
    if (options.jsBehaviorTimeout) urlSearchParams.append("js_behavior_timeout", `${options.jsBehaviorTimeout}`);
    if (options.captureCookie) urlSearchParams.append("capture_cookie", options.captureCookie);
    if (options.targetUsername) urlSearchParams.append("target_username", options.targetUsername);
    if (options.targetPassword) urlSearchParams.append("target_password", options.targetPassword);

    const response = await fetch(new URL(`save`, WAYBACK_API_URL), {
        method: "POST",
        headers: {
            "Accept": "application/json",
            //"Authorization": `LOW ${accessKey}:${secretKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlSearchParams.toString()
    });

    return response.json();
}



export async function getJobStatus(jobId: string): Promise<WaybackJobStatusResponse> {
    const urlSearchParams: URLSearchParams = new URLSearchParams({ jobId });
    const response = await fetch(new URL(`save/status`, WAYBACK_API_URL), {
        method: "POST",
        headers: {
            "Accept": "application/json",
            //"Authorization": `LOW ${accessKey}:${secretKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlSearchParams.toString()
    });
    return response.json();

}

export async function getSystemStatus(): Promise<WaybackSystemStatusResponse> {
    const response = await fetch(new URL(`save/status/system`, WAYBACK_API_URL), {
        headers: {
            "Accept": "application/json"
        }
    });
    return response.json();
}

/**
 * Get status for saved items by current user
 * @returns 
 */
export async function getUserStatus(): Promise<WaybackUserStatusResponse> {
    const response = await fetch(`${new URL(`save/status/system`, WAYBACK_API_URL)}?${new URLSearchParams({ _t: `${new Date().getTime()}}` })}`, {
        headers: {
            "Accept": "application/json"
            //"Authorization": `LOW ${accessKey}:${secretKey}`,
        }
    });
    return response.json();
}

type WaybackUserStatusResponse = {
    available: number,
    processing: number;
};

type WaybackSystemStatusResponse = {
    status: string;
};

type WaybackSavePageResult = {
    url: string,
    job_id: string;
};


type WaybackJobStatusResponse = {
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
    status_ext: StatusExt,
    job_id: string,
    message: string,
    resources: [];
};

const WaybackErrorMapping = {
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
    use_user_agent?: string;
} & ({
    targetUsername?: undefined;
    targetPassword?: undefined;
} | {
    /** Use your own username and password in the target page’s login forms. */
    targetUsername: string;
    targetPassword: string;
});

export async function retrieve(url: string) {

}

function createSearchParams(options: Record<string, string | string[] | number | undefined | boolean>): URLSearchParams {
    const urlSearchParams = new URLSearchParams();
    for (let entry of Object.entries(options)) {
        const [key, value] = entry;
        if (value === undefined) continue;
        switch (typeof value) {
            case "string":
            case "number":
            case "boolean":
                urlSearchParams.append(key, `${value}`);
                break;
            // TODO why is this even here
            /*
            case "object":
                for (let item of value as any) {
                    urlSearchParams.append(key, `${item}`);
                }
                break;*/
            default:
                throw new IaTypeError(`Invalid option value type: ${typeof value}`);
        }
    }
    return urlSearchParams;
}

// TODO add auth token

/**
 * Get snapshot matches for given url
 * @see {@link https://archive.org/developers/wayback-cdx-server.html}
 * @param url 
 * @param options 
 * @returns Results as an array of result objects
 */
export async function getSnapshotMatches<T extends WaybackCdxField[] | undefined>(url: string, options?: WaybackCdxOptions<T>):
    Promise<Prettify<WaybackSnapshotResponse<T>>[]> {

    /** New options object where fls are merged into a single comma-separated string */
    const opt: Omit<WaybackCdxOptions<T>, "fl"> & { fl?: string; } | undefined = {
        ...options,
        fl: options?.fl?.join(",")
    };

    /** Search params object that forms the arguments for the API call */
    const searchParams = createSearchParams({ ...opt, url, output: "json" });

    log.verbose(`${WAYBACK_CDX_API_URL}?${searchParams.toString()}`);
    // TODO make this use the session get method
    const matches: ArrayOfArraysWithHeaderRow<any> = await (await fetch(`${WAYBACK_CDX_API_URL}?${searchParams.toString()}`,)).json();

    return convertArrayOfArraysWithHeaderRow(matches) as Prettify<WaybackSnapshotResponse<T>>[];
}

// All possible fields that can be returned by the WayBack CDX API
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

type WaybackGetAvailabilityResponse = {
    archived_snapshots: {
        closest?: WaybackAvailabilityData;
    };
};


/**
 * Get most recent match, or match closest to specified timestamp
 * @param url URL to get the match for
 * @param timestamp Optional timestamp
 * @returns If no timestamp is provided: closest match to current date. If timestamp is provided: closest match to timestamp
 */
export async function getAvailability(url: string, timestamp?: string | Date): Promise<WaybackAvailabilityData | undefined> {
    const searchParams = createSearchParams({ url });
    if (timestamp) {
        searchParams.append('timestamp', typeof timestamp === "string" ? timestamp : dateToYYYYMMDDHHMMSS(timestamp));
    }
    const data: WaybackGetAvailabilityResponse = await (await fetch(`http://archive.org/wayback/available?${searchParams.toString()}`,)).json();
    return data.archived_snapshots.closest;
}

type WaybackCdxCollapseOption = WaybackCdxField | `${WaybackCdxField}:${number}`;

type WaybackSnapshotInfo = {
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

type WaybackSnapshotOptionalFields = {
    /** shows duplicates */
    dupecount: string;
};

type WaybackSnapshotResponse<F extends WaybackCdxField[] | undefined, O extends WaybackCdxOptions<F> = WaybackCdxOptions<F>> = Prettify<
    (F extends WaybackCdxField[] ? Pick<WaybackSnapshotInfo, F[number]> : WaybackSnapshotInfo) &
    (O extends { showDupeCount: true; } ? Pick<WaybackSnapshotOptionalFields, "dupecount"> : {})>;

export type WaybackCdxField = Prettify<keyof WaybackSnapshotInfo>;

type WaybackCdxFilter = `${"!" | ""}${WaybackCdxField}:${string}`;

type WaybackCdxOptions<T extends WaybackCdxField[] | undefined> = {
    /**
     * @default "exact"
     */
    matchType?: WaybackCdxMatchType;
    /**
     * Return the first n results. Use -N to return the last n results
     * @see {@link https://archive.org/developers/wayback-cdx-server.html#query-result-limits}
     */
    limit?: number;
    /**
     * The offset= M param can be used in conjunction with limit to ‘skip’ the first M records. This allows for a simple way to scroll through the results.
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
    from?: number;
    to?: number;
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
    fl: T;
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
};

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
export type WaybackSnapshotMimeType = "text/html" | "warc/revisit" | string;