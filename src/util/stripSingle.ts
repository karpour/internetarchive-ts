
/**
 * If argument is an array, returns the first item in the array, otherwise returns the unchanged argument
 * @param arg Array or non-array
 * @returns First array item or argument
 */
export function stripSingle<T>(arg: T | [T]): T {
    if (Array.isArray(arg)) {
        return arg[0];
    }
    return arg;
}
