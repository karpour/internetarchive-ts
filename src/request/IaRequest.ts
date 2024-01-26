/**
 * @author Thomas Novotny
 * @file A base class for Internet Archive Requests
 */

import { createS3AuthHeader } from "../session/createS3AuthHeader";
import { IaRequestConstructorParams } from "../types/IaParams";

/**
 * A base class for Internet Archive Requests
 */
class IaRequest extends Request {
    public constructor(url: string, params: IaRequestConstructorParams) {
        super(IaRequest.prepareUrl(url, params.params ?? {}), {
            ...params,
            headers: {
                // Compression turned on by default
                ...(params.compression !== false && { "Accept-Encoding": "deflate, gzip" }),
                // only add auth header if accessKey is provided
                ...(params.auth && createS3AuthHeader(params.auth.accessKey, params.auth.secretKey)),
                ...(params.cookies && { 'Cookie': Object.entries(params.cookies).map(([key, value]) => `${key}=${value}`).join('; ') }),
                ...params.headers
            },
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