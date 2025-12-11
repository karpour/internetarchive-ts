

export type ArrayOfArraysWithHeaderRow<T extends string[]> = [
    T,
    ...string[][]
];

/**
 * Converts an array with header row to an array of objects.
 * 
 * @example
 * ```typescript
 * convertArrayOfArraysWithHeaderRow([
 *      ["col1", "col2"],
 *      ["val", "val2"],
 *      ["val3", "val4"],
 * ]); // [ { col1: 'val', col2: 'val2' }, { col1: 'val3', col2: 'val4' } ]
 * ```
 * 
 * @param array Array to process
 * @returns 
 */
export function convertArrayOfArraysWithHeaderRow<T extends string[]>(array: ArrayOfArraysWithHeaderRow<T>): Record<T[number], string>[] {
    const returnObj: Record<T[number], string>[] = [];

    if (array.length == 0) return [];
    const header: T = array.shift()! as T;
    const len = header.length;

    for (const entry of array) {
        const temp: Partial<Record<T[number], string>> = {};
        if (entry.length !== header.length) throw new Error(`Array entry ${JSON.stringify(entry)} has wrong length (should be ${len})`);
        for (let i = 0; i < header.length; i++) {
            const index: T[number] = header[i]! as T[number];
            temp[index] = entry[i]!;
        }
        returnObj.push(temp as Record<T[number], string>);
    }
    return returnObj;
}
