import IaRequest from "./IaRequest";
import { S3RequestConstructorParams } from "../types";
import { prepareMetadata } from "./prepareMetadata";
import { PACKAGE_VERSION } from "../PACKAGE_VERSION";
import { prepareMetadataHeaders } from "./prepareMetadataHeaders";

/**
internetarchive.iarequest
~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (C) 2012-2021 by Internet Archive.
:license: AGPL 3, see LICENSE for more details.
*/



export class S3Request extends IaRequest {
    public constructor(url: string, {
        metadata,
        fileMetadata,
        queueDerive,
        method,
        headers,
        files,
        data,
        params,
        auth,
        cookies,
        hooks }: S3RequestConstructorParams) {
        super(url, {
            method,
            headers: {
                'x-archive-auto-make-bucket': '1',
                'x-archive-queue-derive': queueDerive ? '1' : '0',
                ...headers,
                ...prepareMetadataHeaders(prepareMetadata({ scanner: `Internet Archive Javascript library ${PACKAGE_VERSION}`, ...metadata }), 'meta'),
                ...(fileMetadata ? prepareMetadataHeaders(prepareMetadata(fileMetadata), 'filemeta') : {}),
            },
            files,
            data,
            params,
            auth,
            cookies,
            hooks
        });
    }
}

export default S3Request;