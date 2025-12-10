

export type ArrayOfArraysWithHeaderRow<T = string> = [
    T[],
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
export function convertArrayOfArraysWithHeaderRow<T extends string>(array: ArrayOfArraysWithHeaderRow<T>): Record<T, string>[] {
    const returnObj: Record<T, string>[] = [];

    if (array.length == 0) throw new Error(`Empty array`);
    const header: T[] = array.shift()! as T[];
    const len = header.length;

    for (const entry of array) {
        const temp: Partial<Record<T, string>> = {};
        if (entry.length !== header.length) throw new Error(`Array entry ${JSON.stringify(entry)} has wrong length (should be ${len})`);
        for (let i = 0; i < header.length; i++) {
            const index: T = header[i]!;
            temp[index] = entry[i]!;
        }
        returnObj.push(temp as Record<T, string>);
    }
    return returnObj;
}
