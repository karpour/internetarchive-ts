/**
 * Determine whether the given `input` is iterable.
 *
 * @returns
 */
export function isIterable(input: unknown): input is Iterable<unknown> {
    return Symbol.iterator in Object(input);
}