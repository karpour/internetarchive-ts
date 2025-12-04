/**
 * Recursively deletes keys that have value `valueToDelete` from an object
 * @param obj Object of which to delete keys from
 * @param valueToDelete Value that triggers deletion of a key
 */
export function deleteKeysFromObject<T extends { [key: string]: any; }, RT extends string>(obj: T, valueToDelete: RT): TagsRemoved<T, RT> {
    for (let entry of Object.entries(obj)) {
        const [key, value] = entry;
        if (value === valueToDelete) {
            delete obj[key];
        } else if (typeof value === "object") {
            deleteKeysFromObject(value, valueToDelete);
        }
    }
    return obj as TagsRemoved<T, RT>;
}

/** Type which omits all the keys that hava a value of type `RT` */
export type TagsRemoved<T extends { [key: string]: any; }, RT extends string> = {
    [K in keyof T as T[K] extends RT ? never : K]: T[K] extends { [key: string]: any; } ? TagsRemoved<T[K], RT> : T[K];
} & {};

export default deleteKeysFromObject;