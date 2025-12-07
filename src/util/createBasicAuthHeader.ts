import { IaTypeError } from "../error/index.js";
import { Prettify } from "../types/index.js";

export type BasicAuthHeader = Prettify<{
    Authorization: `Basic ${string}`;
}>;

/**
 * Creates a basic auth header object, to be used in http requests
 * @param accessKey Access key
 * @param secretKey Secret key
 * @returns Basic auth header object
 * @throws IaTypeError
 */
export function createBasicAuthHeader(accessKey: string, secretKey: string): BasicAuthHeader {
    if (!accessKey) throw new IaTypeError(`Invalid accessKey`);
    if (!secretKey) throw new IaTypeError(`Invalid secretKey`);
    return {
        Authorization: `Basic ${btoa(`${accessKey}:${secretKey}`)}`
    };
}