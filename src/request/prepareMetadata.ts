import {extractKeyAndIndex, makeArray} from "../util";


/**
 * Prepare a metadata object for an {@link S3Request} or a {@link IaMetadataRequest}
 * @param newMetadata The metadata dict to be prepared.
 * @param sourceMetadata (optional) The source metadata for the item being modified.
 * @param append 
 * @param appendList 
 * @param insert 
 * @returns A filtered metadata dict to be used for generating IA S3 and Metadata API requests.
 */
export function prepareMetadata(
    newMetadata: Record<string, string>,
    sourceMetadata: Record<string, string | string[]> = {},
    append: boolean = false,
    appendList: boolean = false,
    insert: boolean = false) {

    // Copy of the new Metadata, will be populated in the next for loop
    const metadata: Record<string, string> = {};

    // Make a deepcopy of sourceMetadata if it exists. A deepcopy is
    // necessary to avoid modifying the original dict.
    sourceMetadata = sourceMetadata ? structuredClone(sourceMetadata) : {};
    let preparedMetadata: Record<string, string | string[]> = {};

    // Create indexedKeys counter dict. i.e.: {'subject': 3} -- subject
    // (with the index removed) appears 3 times in the metadata dict.
    const indexedKeys: Record<string, number> = {};
    for (const entry of Object.entries(newMetadata)) {
        const [key, val] = entry;
        // Convert number values to strings into our new metadata array
        metadata[key] = `${val}`;
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


    // Initialize the values for all indexedKeys.
    for (const key in indexedKeys) {
        preparedMetadata[key] = [
            // Initialize the value in the preparedMetadata dict.
            ...makeArray(sourceMetadata[key] ?? []),
            // Fill the value of the preparedMetadata key with "" values
            // so all indexed items can be indexed in order.
            ...(new Array(indexedKeys[key]! - 1).fill(""))
        ];
    }

    // Index all items which contain an index.
    for (const key in metadata) {
        const [parsedKey, idx] = extractKeyAndIndex(key);

        // Insert values from indexed keys into preparedMetadata dict.
        if (idx !== undefined && !insert) {
            if (idx < preparedMetadata[parsedKey]!.length) {
                // This is how it should be
                (preparedMetadata[parsedKey] as string[])[idx] = metadata[key]!;
            } else {
                // IDX exceeds array length?
                // TODO
                (preparedMetadata[parsedKey] as string[]).push(metadata[key]!);
            }
        }

        // If append is True, append value to sourceMetadata value.
        else if (appendList && sourceMetadata[key] !== undefined) {

            // TODO WTF
        } else if (append && sourceMetadata[key] !== undefined) {
            preparedMetadata[key] = `${sourceMetadata[key]} ${metadata[key]}`;
        } else if (insert && sourceMetadata[parsedKey]) {
            const index = idx ?? 0;
            sourceMetadata[parsedKey] = makeArray(sourceMetadata[parsedKey]!).splice(index, 0, metadata[key]!);
            let insert_md: string[] = [];

            for (let _v of sourceMetadata[parsedKey]!) {
                if (!insert_md.includes(_v) && _v) {
                    insert_md.push(_v);
                }
            }
            preparedMetadata[parsedKey] = insert_md;
        } else {
            preparedMetadata[key] = metadata[key]!;
        }
    }

    // Remove values from metadata if value is REMOVE_TAG.
    const _done: string[] = [];
    for (let key in indexedKeys) {
        // Filter None values from items with arrays as values
        preparedMetadata[key] = (preparedMetadata[key] as string[]).filter(v => v);

        // Only filter the given indexed key if it has not already been filtered.
        if (!_done.includes(key)) {
            const [parsedKey, idx] = extractKeyAndIndex(key);
            let indexes: number[] = [];
            for (let k in metadata) {
                const kidx = extractKeyAndIndex(key)[1];
                if (!kidx) {
                    continue;
                } else if (parsedKey !== key) {
                    continue;
                } else if (metadata[k] !== 'REMOVE_TAG') {
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

    return preparedMetadata;
}