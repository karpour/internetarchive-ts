import IaRequest from "./IaRequest.js";
import { S3RequestConstructorParams } from "../types/index.js";
import { prepareMetadata } from "./prepareMetadata.js";
import { PACKAGE_VERSION } from "../PACKAGE_VERSION.js";
import { prepareMetadataHeaders } from "./prepareMetadataHeaders.js";

export class S3Request extends IaRequest {
    public constructor(url: string, {
        metadata,
        fileMetadata,
        queueDerive,
        method,
        headers,
        files,
        params,
        auth,
        cookies
    }: S3RequestConstructorParams) {
        super(url, {
            method,
            headers: {
                'x-archive-auto-make-bucket': '1',
                'x-archive-queue-derive': queueDerive ? '1' : '0',
                ...headers,
                ...prepareMetadataHeaders(prepareMetadata({ metadata: { scanner: `Internet Archive Javascript library ${PACKAGE_VERSION}`, ...metadata } }), 'meta'),
                ...(fileMetadata && prepareMetadataHeaders(prepareMetadata({ metadata: fileMetadata }), 'filemeta')),
            },
            files,
            params,
            auth,
            cookies
        });
    }
}

export default S3Request;