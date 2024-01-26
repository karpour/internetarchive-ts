import { IaItemMetadata } from "../types/IaItemMetadata";
import { IaFileExtendedMetadata } from "../types/IaFileMetadata";
import { IaRequestConstructorParams } from "./IaRequest";
import { HttpHeaders, IaRawMetadataType, IaRawRawMetadataType, NoUnderscoreString, S3RequestConstructorParams } from "../types";
import { makeArray } from "../util";
import { needsQuote } from "../util/needsQuote";
import { createIaHeaderMetaKey } from "../util/createIaHeaderMetaEntry";

/**
internetarchive.iarequest
~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (C) 2012-2021 by Internet Archive.
:license: AGPL 3, see LICENSE for more details.
*/


export class S3Request extends IaRequest {

    protected metadata: IaItemMetadata;
    protected fileMetadata: IaFileExtendedMetadata;
    protected queueDerive: boolean;

    public constructor({
        metadata = {},
        fileMetadata,
        queueDerive,
        accessKey,
        secretKey,
        method,
        url,
        headers = {},
        files = [],
        data = [],
        params = {},
        auth,
        cookies,
        hooks = {},
        json }: S3RequestConstructorParams & IaRequestConstructorParams) {

        super({ method, url, headers, files, data, params, auth, cookies, hooks, json });

        this.metadata = metadata;
        this.fileMetadata = fileMetadata;
        this.queueDerive = queueDerive;
        if (!this.auth) {
            this.auth = new S3Auth(accessKey, secretKey);
        }
    }

    public prepare() {
        const p = new S3PreparedRequest();
        p.prepare({
            method: this.method,
            url: this.url,
            headers: this.headers,
            files: this.files,
            data: this.data,
            params: this.params,
            auth: this.auth,
            cookies: this.cookies,
            hooks: this.hooks,

            // S3Request kwargs.
            metadata: this.metadata,
            fileMetadata: this.fileMetadata,
            queueDerive: this.queueDerive,
        });
        return p;
    }
}


export class S3PreparedRequest extends IaPreparedRequest {
    public prepare(method?: any, url?: any, headers?: any, files?: any, data?: any,
        params?: any, auth?: any, cookies?: any, hooks?: any, queueDerive?: any,
        metadata?: any, fileMetadata?: any) {
        this.prepareMethod(method);
        this.prepareUrl(url, params);
        this.prepareHeaders(headers, metadata,
            fileMetadata = fileMetadata,
            queueDerive = queueDerive);
        this.prepareCookies(cookies);
        this.prepareBody(data, files);
        this.prepareAuth(auth, url);
        // Note that prepareAuth must be last to enable authentication schemes
        // such as OAuth to work on a fully prepared request.

        // This MUST go after prepareAuth. Authenticators could add a hook
        this.prepareHooks(hooks);
    }

    /**Convert a dictionary of metadata into S3 compatible HTTP
    headers, and append headers to ``headers``.
 
    :type metadata: dict
    :param metadata: Metadata to be converted into S3 HTTP Headers
                     and appended to ``headers``.
 
    :type headers: dict
    :param headers: (optional) S3 compatible HTTP headers.
 
    */
    public prepareHeaders(headers: HttpHeaders, metadata: IaItemMetadata, fileMetadata: any = {}, queueDerive: boolean = true) {
        if (!metadata.scanner) {
            metadata.scanner = `Internet Archive Javascript library ${PACKAGE_VERSION}`;
        }
        const preparedMetadata = prepareMetadata(metadata);
        const preparedFileMetadata = prepareMetadata(fileMetadata);

        headers['x-archive-auto-make-bucket'] = '1';
        if (!headers['x-archive-queue-derive']) {
            headers['x-archive-queue-derive'] = queueDerive ? '1' : '0';

        }
        // Parse the prepared metadata into HTTP headers,
        // and add them to the ``headers`` dict.
        prepareMetadataHeaders(preparedMetadata);
        prepareMetadataHeaders(preparedFileMetadata, 'filemeta');

        super.prepareHeaders(headers);
    }


}

export default S3PreparedRequest;

/**
 * Determine whether the given `input` is iterable.
 *
 * @returns
 */
function isIterable(input: any): input is Iterable<any> {
    if (input === null || input === undefined) {
        return false;
    }

    return typeof input[Symbol.iterator] === 'function';
}


// TODO check 
function prepareMetadataHeaders<T extends IaRawMetadataType, MT extends IaMetaType>(preparedMetadata: T, metaType: MT): IaMetaDataHeaders<T, MT> {
    for (const entry of Object.entries(preparedMetadata)) {
        let [metaKey, metaValue] = entry;
        // Encode arrays into JSON strings because Archive.org does not
        // yet support complex metadata structures in
        // <identifier>_meta.xml.
        if (typeof (metaValue) === 'object' && !Array.isArray(metaValue)) {
            metaValue = JSON.stringify(metaValue);
        }
        // Convert the metadata value into a list if it is not already
        // iterable.

        metaValue = makeArray(metaValue);
        const headers: HttpHeaders = {};

        // Convert metadata items into HTTP headers and add to
        // ``headers`` dict.
        for (const entry of Object.entries(metaValue)) {
            let [i, value] = entry;
            if (!value)
                continue;
            const headerKey = createIaHeaderMetaKey(metaKey,metaType,parseInt(i)))
            value = `${value}`;
            if (needsQuote(value)) {
                value = `uri(${encodeURIComponent(value)})`;
            }
            // because rfc822 http headers disallow _ in names, IA-S3 will
            // translate two hyphens in a row (--) into an underscore (_).
            headerKey = headerKey.replace('_', '--');
            headers[header_key] = value;
        }
    }
}