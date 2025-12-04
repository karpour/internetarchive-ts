import { HttpHeaders, IaMetaDataHeaders, IaMetaType, IaRawMetadata } from "../types";
import { needsQuote } from "../util/needsQuote";
import { createIaHeaderMetaKey } from "../util/createIaHeaderMetaKey";

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
        const [metaKey, metaValue] = entry;
        // Remove undefined values
        if (metaValue === undefined) continue;

        if (Array.isArray(metaValue)) {
            // Convert metadata items into HTTP headers
            for (const entry of Object.entries(metaValue)) {
                let [i, value] = entry;
                // Remove empty array values
                if (!value) continue;
  
                const headerKey = createIaHeaderMetaKey(metaKey, metaType, parseInt(i));
                headers[headerKey] = needsQuote(value) ? `uri(${encodeURIComponent(value)})` : value;
            }
        } else {
            const headerKey = createIaHeaderMetaKey(metaKey, metaType);
            headers[headerKey] = metaValue;
        }
    }
    return headers as IaMetaDataHeaders<T, MT>;
}
