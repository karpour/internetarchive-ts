/** A string in the format `keyname[idx]` */
export type KeyWithIndex<K extends string = string, I extends number = number> = `${K}[${I}]`;

/** A type that represents the `"keyname"` part of a `keyname[idx]` */
export type KeyWithIndexRemoved<T extends string> = T extends KeyWithIndex<infer K, any> ? (K extends "" ? never : `${K}`) : T;

/** A type that represents the `idx` part of a `keyname[idx]`, which can be a number or undefined if the key has no index */
export type KeyIndex<T extends string> = T extends KeyWithIndex<any, infer I> ? I : number | undefined;

/**
 * Extracts key and index from a key that has the format `keyname[idx]`
 * If the key does not have an index in square brackets, the second value of the tuple will be undefined
 * @param keyWithIndex key to process
 * @returns tuple containing key name and index. Index will be undefined if key has no [idx]
 */
export function extractKeyAndIndex<T extends string | KeyWithIndex>(keyWithIndex: T): [key: KeyWithIndexRemoved<T>, idx: KeyIndex<T>] {
    const RegExpparsedKeyWithIdx = /^(?<key>[^\[\]]+)(?:\[(?<idx>\d+)\]$)?/;
    const result = RegExpparsedKeyWithIdx.exec(keyWithIndex);
    if (result?.groups?.key) {
        const idx = result?.groups?.idx;
        return [result.groups.key as KeyWithIndexRemoved<T>, (idx ? Number(idx) : undefined) as KeyIndex<T>];
    }
    throw new Error(`Could not extract key and index from key "${keyWithIndex}"`);
}