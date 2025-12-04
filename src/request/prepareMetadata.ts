import { IaBaseMetadataType, IaRawMetadata } from "../types";
import { extractKeyAndIndex, makeArray } from "../util";
import { convertToRawMetadata } from "../util/convertToRawMetadata";


type IaPrepareMetadataParams<M extends IaBaseMetadataType, S extends IaBaseMetadataType> = {
    metadata: M,
    sourceMetadata?: S,
    append?: boolean,
    appendList?: boolean,
    insert?: boolean;
};

/** @internal */
export function createIndexedKeys(metadata: IaBaseMetadataType, sourceMetadata: IaBaseMetadataType = {}): [indexedKeys: Record<string, number>, metadataStringified: Record<string, string>] {
    /** Copy of the new Metadata with all values stringified */
    const metadataStringified: Record<string, string> = {};
    /** indexedKeys counter Record
     * @example
     * { subject: 3 } // subject (with the index removed) appears 3 times in the metadata dict.
     */
    const indexedKeys: Record<string, number> = {};
    for (const [key, val] of Object.entries(metadata)) {
        // Convert number values to strings into our new metadata array
        metadataStringified[key] = `${val}`;
        const [parsedKey, idx] = extractKeyAndIndex(key);
        if (idx !== undefined) {
            const cnt = indexedKeys[parsedKey];
            indexedKeys[parsedKey] = cnt === undefined ?
                // Initialize count.
                // If key without index exists, already count it here
                (sourceMetadata[parsedKey] !== undefined ? 2 : 1) :
                // Otherwise, increase counter
                cnt + 1;
        }
    }
    return [indexedKeys, metadataStringified];
}

/**
 * Prepare a metadata object for an {@link S3Request} or a {@link IaMetadataRequest}
 * @param newMetadata The metadata to be prepared.
 * @param sourceMetadata (optional) The source metadata for the item being modified.
 * @param append 
 * @param appendList 
 * @param insert 
 * @returns A filtered metadata dict to be used for generating IA S3 and Metadata API requests.
 */
export function prepareMetadata<M extends IaBaseMetadataType, S extends IaBaseMetadataType>({
    metadata,
    sourceMetadata,
    append = false,
    appendList = false,
    insert = false }: IaPrepareMetadataParams<M, S>): IaRawMetadata<M & S> {

    // TODO convert source and new metadata to raw
    // Make a deepcopy of sourceMetadata if it exists. A deepcopy is
    // necessary to avoid modifying the original dict.
    const sourceMetadataRaw: IaRawMetadata = sourceMetadata ? convertToRawMetadata(sourceMetadata) : {};
    const preparedMetadata: IaRawMetadata = {};

    const [indexedKeys, metadataStringified] = createIndexedKeys(metadata, sourceMetadataRaw);

    // Initialize the values for all indexedKeys.
    for (const [key, cnt] of Object.entries(indexedKeys)) {
        preparedMetadata[key] = [
            // Initialize the value in the preparedMetadata dict.
            ...makeArray(sourceMetadataRaw[key] ?? []),
            // Fill the value of the preparedMetadata key with "" values
            // so all indexed items can be indexed in order.
            ...(new Array(cnt - 1).fill(""))
        ];
    }

    // Index all items which contain an index.
    for (const key in metadataStringified) {
        const [parsedKey, idx] = extractKeyAndIndex(key);

        // Insert values from indexed keys into preparedMetadata dict.
        if (idx !== undefined && !insert) {
            if (idx < preparedMetadata[parsedKey]!.length) {
                // This is how it should be
                (preparedMetadata[parsedKey] as string[])[idx] = metadataStringified[key]!;
            } else {
                // IDX exceeds array length?
                // TODO
                (preparedMetadata[parsedKey] as string[]).push(metadataStringified[key]!);
            }
        } else if (appendList && sourceMetadataRaw[key] !== undefined) {
            // If append is True, append value to sourceMetadata value.

            // TODO WTF
        } else if (append && sourceMetadataRaw[key] !== undefined) {
            preparedMetadata[key] = `${sourceMetadataRaw[key]} ${metadataStringified[key]}`;
        } else if (insert && sourceMetadataRaw[parsedKey]) {
            const index = idx ?? 0;
            const tempArray = makeArray(sourceMetadataRaw[parsedKey]!).splice(index, 0, metadataStringified[key]!);
            const insert_md: string[] = [];

            for (let _v of tempArray) {
                if (!insert_md.includes(_v) && _v) {
                    insert_md.push(_v);
                }
            }
            preparedMetadata[parsedKey] = insert_md;
        } else {
            preparedMetadata[key] = metadataStringified[key]!;
        }
    }

    // Remove values from metadata if value is REMOVE_TAG.
    const _done: string[] = [];
    for (let key in indexedKeys) {
        // Filter None values from items with arrays as values
        preparedMetadata[key] = (preparedMetadata[key] as string[]).filter(v => v);

        // Only filter the given indexed key if it has not already been filtered.
        if (!_done.includes(key)) {
            const [parsedKey, kidx] = extractKeyAndIndex(key);
            let indexes: number[] = [];
            for (let k in metadataStringified) {
                if (!kidx) {
                    continue;
                } else if (parsedKey !== key) {
                    continue;
                } else if (metadataStringified[k] !== 'REMOVE_TAG') {
                    continue;
                } else {
                    indexes.push(kidx);
                }
            }

            // Delete indexed values in reverse to not throw off the subsequent indexes.
            for (let i of indexes.sort((a, b) => b - a)) {
                (preparedMetadata[key] as string[]).splice(i, 1);
            }

            _done.push(key);
        }
    }

    return preparedMetadata as IaRawMetadata<M & S>;
}