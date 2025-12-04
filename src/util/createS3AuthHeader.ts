import { IaTypeError } from "../error";
import { Prettify } from "../types";

export type S3AuthHeader<AccessKey extends string = string, SecretKey extends string = string> = Prettify<{
    Authorization: `LOW ${AccessKey}:${SecretKey}`;
}>;

/**
 * Creates S3 Auth header which can be used in HTTP requests
 * @param accessKey Access key
 * @param secretKey Secret key
 * @returns Auth header
 * @throws IaTypeError
 */
export function createS3AuthHeader<A extends string, S extends string>(accessKey: A, secretKey: S): S3AuthHeader<A, S> {
    if (!accessKey) throw new IaTypeError(`Invalid accessKey`);
    if (!secretKey) throw new IaTypeError(`Invalid secretKey`);
    return {
        Authorization: `LOW ${accessKey}:${secretKey}`
    };
}