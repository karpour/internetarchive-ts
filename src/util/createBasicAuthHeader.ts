import { Prettify } from "../types";

export type BasicAuthHeader = Prettify<{
    Authorization: `Basic ${string}`;
}>;

export function createBasicAuthHeader(accessKey: string, secretKey: string): BasicAuthHeader {
    return {
        Authorization: `Basic ${btoa(`${accessKey}:${secretKey}`)}`
    };
}