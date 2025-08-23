
const RegExp_IA_IDENTIFIER = /^[A-Za-z0-9-_\.]+$/;
/**
 * Check whether a string is a valid Internet Archive Identifier
 * @param identifier String to check
 * @returns true if passed string is a valid Internet Archive identifier
 */
export function isValidIaIdentifier(identifier: string): boolean {
    // TODO make sure this is correct
    return RegExp_IA_IDENTIFIER.test(identifier);
}
