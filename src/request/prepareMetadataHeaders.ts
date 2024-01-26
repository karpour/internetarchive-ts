import { HttpHeaders, IaMetaDataHeaders, IaMetaType, IaRawMetadata } from "../types";
import { makeArray } from "../util";
import { needsQuote } from "../util/needsQuote";
import { createIaHeaderMetaKey } from "../util/createIaHeaderMetaEntry";

/**
 * Converts metadata into S3 compatible HTTP headers
 * @param preparedMetadata Metadata to be converted into S3 HTTP Headers
 * @param metaType Meta type, either 'meta' or 'filemeta'
 * @template T Meta data type override
 * @returns HTTP Headers object
 */
export function prepareMetadataHeaders<T extends IaRawMetadata, MT extends IaMetaType>(preparedMetadata: T, metaType: MT): IaMetaDataHeaders<T, MT> {
    const headers: HttpHeaders = {};
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

        // Convert metadata items into HTTP headers and add to
        // ``headers`` dict.
        for (const entry of Object.entries(metaValue)) {
            let [i, value] = entry;
            if (!value)
                continue;
            // because rfc822 http headers disallow _ in names, IA-S3 will
            // translate two hyphens in a row (--) into an underscore (_).
            const headerKey = createIaHeaderMetaKey(metaKey, metaType, parseInt(i));
            value = `${value}`;
            if (needsQuote(value)) {
                value = `uri(${encodeURIComponent(value)})`;
            }
            headers[headerKey] = value;
        }
    }
    return headers as IaMetaDataHeaders<T, MT>;
}
