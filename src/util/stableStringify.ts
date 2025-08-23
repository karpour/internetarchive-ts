/**
 * Deterministic stringify function for creating a stringified representation of {@link IaItemData} for hash generation
 * This method does not handle circular references, functions, etc.
 * @param obj Object to stringify
 * @returns Stringified representation
 */
export default function stableStringify(obj: Record<any, any>): string {
    if (Array.isArray(obj)) {
        return `[${obj.map(stableStringify).join(',')}]`;
    } else if (obj !== null && typeof obj === 'object') {
        const keys = Object.keys(obj).sort();
        return `{${keys.map(key => `"${key}":${stableStringify(obj[key])}`).join(',')}}`;
    } else {
        return JSON.stringify(obj);
    }
}
