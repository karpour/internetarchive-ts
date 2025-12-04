

/**
 * Creates an array from the input. If the input is already an Array, the items are returned unchanged. 
 * If a non-Array argument is supplied, it is turned into an Array
 * @param items input
 * @returns Unchanged array or array containing items argument
 */
export function makeArray<T>(items: T | T[]): T extends undefined ? undefined : T[] {
    if (items === undefined) return undefined as T extends undefined ? undefined : T[];
    return (Array.isArray(items) ? items : [items]) as T extends undefined ? undefined : T[];
}