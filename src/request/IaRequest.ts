/**
 * @author Thomas Novotny
 * @file A base class for Internet Archive Requests
 */

import { HttpMethod, createIaAuthHeader } from "../types/IaTypes";




interface RequestInit {
    /** A BodyInit object or null to set request's body. */
    body?: BodyInit | null;
    /** A string indicating how the request will interact with the browser's cache to set request's cache. */
    cache?: RequestCache;
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: RequestCredentials;
    /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
    headers?: HeadersInit;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** A boolean to set request's keepalive. */
    keepalive?: boolean;
    /** A string to set request's method. */
    method?: string;
    /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
    mode?: RequestMode;
    /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: RequestRedirect;
    /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
    referrer?: string;
    /** A referrer policy to set request's referrerPolicy. */
    referrerPolicy?: ReferrerPolicy;
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
    /** Can only be null. Used to disassociate request from any Window. */
    window?: null;
}

export type IaSessionParams = {
    /** IA-S3 accessKey to use when making the given request. */
    accessKey: string;
    /** IA-S3 secretKey to use when making the given request. */
    secretKey: string;
};

export type IaRequestConstructorParams = {
    /** Method */
    method: HttpMethod;
    /** URL, only http is supported */
    url: string;
    /** A Headers object */
    headers?: Record<string, string>;
    files?: string[];
    data?: string[];
    params?: Record<string, string>;
    cookies?: Record<string, string>;
    hooks?: any;
    json?: any;
    /** A BodyInit object or null to set request's body. */
    body?: BodyInit | null;
    auth?: IaSessionParams;
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: RequestCredentials;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** Accept a compressed response
     * @default true
     */
    compression?: boolean;
};


/**
 * A base class for Internet Archive Requests
 */
class IaRequest extends Request {
    public constructor({
        method,
        url,
        headers,
        params = {},
        cookies,
        auth,
        body,
        credentials,
        integrity,
        compression = true
    }: IaRequestConstructorParams) {
        super(IaRequest.prepareUrl(url, params), {
            method,
            headers: {
                // Compression turned on by default
                ...(compression && { "Accept-Encoding": "deflate, gzip" }),
                // only add auth header if accessKey is provided
                ...(auth && createIaAuthHeader(auth.accessKey, auth.secretKey)),
                ...(cookies && { 'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ') }),
                ...headers
            },
            body,
            credentials,
            integrity
        });
    }


    /**
     * Creates a URL with search params
     * @param url URL
     * @param params search params to add
     * @returns URL with URLencoded params
     */
    public static prepareUrl(url: string, params: Record<string, string>): string {
        const urlObject = new URL(url);
        if (urlObject.protocol !== 'http') throw new Error(`Only HTTP URLs are allowed`);
        for (const entry of Object.entries(params)) {
            const [key, value] = entry;
            urlObject.searchParams.append(key, value);
        }
        return urlObject.toString();
    }
}


export default IaRequest;