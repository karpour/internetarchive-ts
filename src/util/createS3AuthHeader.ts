import { Prettify } from "../types";

export type S3AuthHeader<AccessKey extends string = string, SecretKey extends string = string> = Prettify<{
    Authorization: `LOW ${AccessKey}:${SecretKey}`;
}>;

export function createS3AuthHeader<A extends string, S extends string>(accessKey: A, secretKey: S): S3AuthHeader<A, S> {
    return {
        Authorization: `LOW ${accessKey}:${secretKey}`
    };
}