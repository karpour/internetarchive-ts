

export type ArrayOfArraysWithHeaderRow<T> = [
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
 * ])
 * [ { col1: 'val', col2: 'val2' }, { col1: 'val3', col2: 'val4' } ]
 * ```
 * 
 * @param array 
 * @returns 
 */
export function convertArrayOfArraysWithHeaderRow<T extends string>(array: ArrayOfArraysWithHeaderRow<T>): Record<T, string>[] {
    const returnObj: Record<T, string>[] = [];

    if (array.length == 0) throw new Error(`No matches`);
    const header: T[] = array.shift()! as T[];

    for (const entry of array) {
        const temp: Partial<Record<T, string>> = {};
        for (let i = 0; i < header.length; i++) {
            const index: T = header[i]!;
            temp[index] = entry[i]!;
        }
        returnObj.push(temp as Record<T, string>);
    }
    return returnObj;
}

console.log(convertArrayOfArraysWithHeaderRow([
    ["col1", "col2"],
    ["val", "val2"],
    ["val3", "val4"],
]));