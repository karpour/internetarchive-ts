/**
 * This file implements functions to access the 
 * {@link https://archive.org/developers/wayback-cdx-server.html | Wayback CDX Server API }.
 */

import log from "../log/index.js";
import IaCookieJar from "../session/IaCookieJar.js";
import { HttpHeaders, IaAuthConfig, Prettify } from "../types/index.js";
import { createS3AuthHeader, dateToIaTimestamp, handleIaApiError, makeArray, sleepMs, urlWithParams } from "../util/index.js";
import { ArrayOfArraysWithHeaderRow, convertArrayOfArraysWithHeaderRow } from "../util/convertArrayOfArraysWithHeaderRow.js";
import { createSearchParams } from "../util/createSearchParams.js";
import { WaybackSaveOptions, WaybackSavePageResult, WaybackJobStatusResponse, WaybackSystemStatusResponse, WaybackUserStatusResponse, WaybackAvailabilityData, WaybackCdxField, WaybackCdxOptions, WaybackSnapshotResponse, WaybackGetAvailabilityResponse, WaybackCdxOptionsWithResume, WaybackCdxOptionsWithoutResume } from "./WaybackMachineTypes.js";
import { validateIaTimestamp } from "../util/validateIaTimestamp.js";

export class WaybackMachine {
    public readonly host: string;
    public readonly protocol: string;
    public readonly url: string;
    protected readonly cookies: IaCookieJar;
    public readonly accessKey?: string;
    public readonly secretKey?: string;
    public readonly auth?: HttpHeaders;

    public constructor(protected config: IaAuthConfig = {}) {
        this.host = config.general?.host ?? "web.archive.org";
        this.protocol = (config.general?.secure ?? true) ? "https" : "http";
        this.url = `${this.protocol}://${this.host}`;
        this.cookies = new IaCookieJar();

        if (this.config.cookies) {
            this.cookies.addCookies(this.config.cookies);
        }
        this.accessKey = this.config.s3?.access;
        this.secretKey = this.config.s3?.secret;

        if (this.accessKey && this.secretKey) {
            this.auth = createS3AuthHeader(this.accessKey, this.secretKey);
        }
    }

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
     * @param options.useUserAgent
     * @param options.targetUsername
     * @param options.targetPassword
     */
    public async save(url: string, options: WaybackSaveOptions = {}): Promise<WaybackSavePageResult> {
        const urlSearchParams: URLSearchParams = new URLSearchParams({ url });
        if (options.captureAll) urlSearchParams.append("capture_all", "1");
        if (options.captureOutlinks) urlSearchParams.append("capture_outlinks", "1");
        if (options.captureScreenshot) urlSearchParams.append("capture_screenshot", "1");
        if (options.delayWbAvailability) urlSearchParams.append("delay_wb_availability", "1");
        if (options.forceGet) urlSearchParams.append("force_get", "1");
        if (options.skipFirstArchive) urlSearchParams.append("skip_first_archive", "1");
        if (options.ifNotArchivedWithin) urlSearchParams.append("if_not_archived_within", `${options.ifNotArchivedWithin}`);
        if (options.outlinksAvailability) urlSearchParams.append("outlinks_availability", "1");
        if (options.emailResult) urlSearchParams.append("email_result", "1");
        if (options.jsBehaviorTimeout !== undefined) urlSearchParams.append("js_behavior_timeout", `${options.jsBehaviorTimeout}`);
        if (options.captureCookie) urlSearchParams.append("capture_cookie", options.captureCookie);
        if (options.useUserAgent) urlSearchParams.append("use_user_agent", options.useUserAgent);
        if (options.targetUsername) urlSearchParams.append("target_username", options.targetUsername);
        if (options.targetPassword) urlSearchParams.append("target_password", options.targetPassword);

        const response = await fetch(`${this.url}/save`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                ...this.auth
            },
            body: urlSearchParams.toString()
        });

        if (response.status !== 200) {
            throw await handleIaApiError({ response });
        }

        return response.json();
    }

    public async getJobStatus(jobId: string): Promise<WaybackJobStatusResponse> {
        const urlSearchParams: URLSearchParams = new URLSearchParams({ jobId });
        const response = await fetch(`${this.url}/save/status`, {
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

    public async getSystemStatus(): Promise<WaybackSystemStatusResponse> {
        const response = await fetch(`${this.url}/save/status/system`, {
            headers: {
                "Accept": "application/json",
                ...this.auth
            }
        });
        return response.json();
    }

    /**
     * Get status for saved items by current user
     * @returns 
     */
    public async getUserStatus(): Promise<WaybackUserStatusResponse> {
        const _url = urlWithParams(`${this.url}/save/status/system`, { _t: `${new Date().getTime()}}` });
        const response = await fetch(_url, {
            headers: {
                "Accept": "application/json",
                ...this.auth
            }
        });
        if (response.status !== 200) {
            throw await handleIaApiError({ response });
        }
        return response.json() as Promise<WaybackUserStatusResponse>;
    }

    /**
     * Get most recent match, or match closest to specified timestamp
     * @param url URL to get the match for
     * @param timestamp Optional timestamp
     * @returns If no timestamp is provided: closest match to current date;
     * If timestamp is provided: closest match to timestamp; 
     * `undefined` if no match is found
     */
    public async getAvailability(url: string, timestamp?: string | Date): Promise<WaybackAvailabilityData | undefined> {
        const params: Record<string, string> = { url };
        if (timestamp) {
            if (typeof timestamp === "string") {
                validateIaTimestamp(timestamp);
                params.timestamp = timestamp.padEnd(14, "0");
            } else {
                params.timestamp = dateToIaTimestamp(timestamp);
            }
        }
        const _url = urlWithParams(`${this.url.replace("web.", "")}/wayback/available`, params);
        const response = await fetch(_url);
        if (response.status !== 200) {
            throw await handleIaApiError({ response });
        }
        const data = await response.json() as WaybackGetAvailabilityResponse;
        //console.log(data);
        return data.archived_snapshots.closest;
    }

    /**
     * Get snapshot matches for given url
     * @see {@link https://archive.org/developers/wayback-cdx-server.html}
     * @see {@link https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server#basic-usage}
     * @param url url to search snapshots for. Can contain `*` wildcards
     * @param options Options
     * @returns Results as an array of result objects
     */
    public async getSnapshotMatches<T extends WaybackCdxField[] | undefined>(url: string, options?: WaybackCdxOptionsWithoutResume<T>):
        Promise<WaybackSnapshotResponse<T>[]>;
    public async getSnapshotMatches<T extends WaybackCdxField[] | undefined>(url: string, options?: WaybackCdxOptionsWithResume<T>):
        Promise<{ result: WaybackSnapshotResponse<T>[]; resumeKey?: string; }>;
    public async getSnapshotMatches<T extends WaybackCdxField[] | undefined>(url: string, options?: WaybackCdxOptions<T>):
        Promise<WaybackSnapshotResponse<T>[] | { result: WaybackSnapshotResponse<T>[]; resumeKey?: string; }> {

        // URI encode url if url contains a query
        if (url.includes("?")) {
            url = encodeURIComponent(url);
        }

        /** Search params object that forms the arguments for the API call */
        const searchParams = createSearchParams({ ...options, url, output: "json" });

        const _url = urlWithParams(`${this.url}/cdx/search/cdx`, { ...options, url, output: "json" });
        log.verbose(`${this.url}/cdx/search/cdx?${searchParams.toString()}`);

        // TODO make this use the session get method
        const matches: ArrayOfArraysWithHeaderRow = await fetch(`${this.url}/cdx/search/cdx?${searchParams.toString()}`,).then(response => response.json());

        if (options?.showResumeKey) {
            let resumeKey: string | undefined = undefined;
            if (matches[matches.length - 2]?.length == 0) {
                // If a resumeKey is present, the second to last element should be `[]` and the last element should be `["<resumeKey>"]`
                const resumeKey = matches.pop()?.[0];
                if (!resumeKey) throw new Error(`Expected resumeKey`);
                matches.pop(); // remove empty line
            }
            return {
                result: convertArrayOfArraysWithHeaderRow(matches) as Prettify<WaybackSnapshotResponse<T>>[],
                resumeKey
            };
        }
        return convertArrayOfArraysWithHeaderRow(matches) as Prettify<WaybackSnapshotResponse<T>>[];
    }

    /**
     * Returns an `AsyncGenerator` that yields single snapshot matches.
     * The generator will go through all available matches.
     * This function makes use of the {@link https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server#resumption-key | resumeKey}
     * @param url url to search snapshots for. Can contain `*` wildcards
     * @param options Options
     */
    public async* getSnapshotMatchesGenerator<T extends WaybackCdxField[] | undefined>(
        url: string, options?: WaybackCdxOptions<T>
    ): AsyncGenerator<WaybackSnapshotResponse<T>> {
        const opts: WaybackCdxOptions<T> = { ...options, showResumeKey: true };
        let matches = await this.getSnapshotMatches(url, opts as WaybackCdxOptionsWithResume<T>);
        do {
            for (const match of matches.result) {
                yield match;
            }
            if (!matches.resumeKey) break;
            await sleepMs(1000);
            matches = await this.getSnapshotMatches(url, { ...opts, resumeKey: matches.resumeKey } as WaybackCdxOptionsWithResume<T>);
        } while (true);
    }
}

export default WaybackMachine;