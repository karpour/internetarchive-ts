/**
 * Determine whether the given `input` is iterable.
 *
 * @returns
 */
export function isIterable(input: any): input is Iterable<any> {
    if (input === null || input === undefined) {
        return false;
    }
    return typeof input[Symbol.iterator] === 'function';
}
