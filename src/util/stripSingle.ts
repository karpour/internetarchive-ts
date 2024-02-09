export function stripSingle<T>(arg: T | [T]): T {
    if (Array.isArray(arg)) {
        return arg[0];
    }
    return arg;
}
