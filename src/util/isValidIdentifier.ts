import { validateIaIdentifier } from "./validateIaIdentifier";

/**
 * Check whether a string is a valid Internet Archive Identifier
 * @param identifier String to check
 * @returns true if passed string is a valid Internet Archive identifier
 */
export function isValidIaIdentifier(identifier: string): boolean {
    try {
        validateIaIdentifier(identifier);
    } catch {
        return false;
    }
    return true;
}