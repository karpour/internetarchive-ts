/**
 * Metadata key should start with a letter, and only lowercase letters, digits, hypens, and underscores are allowed.
 * 
 */

/**
 * Checks if string is a valid metadata key
 * @param name metedata key to check
 * @returns true if key is valid
 */
export function isValidMetadataKey(name: string): boolean {
    return /^[a-z][\-0-9a-z_]*$/.test(name);
}

/**
 * Checks if string is a valid metadata key with optional index
 * @param name metedata key to check
 * @returns true if key is valid
 */
export function isValidMetadataKeyWithIndex(name: string): boolean {
    return /^[a-z][\-0-9a-z_]*(?:\[\d+\])?$/.test(name);
}