// TODO is 0-9 valid?
/**
 * According to the documentation a metadata key
 * has to be a valid XML tag name.
 * 
 * The actual allowed tag names (at least as tested with the metadata API),
 * are way more restrictive and only allow ".-A-Za-z_", possibly followed
 * by an index in square brackets e. g. [0].
 * On the other hand the Archive allows tags starting with the string "xml". 
 */
export function isValidMetadataKey(name: string): boolean {
    return /^[A-Za-z][.\-0-9A-Za-z_]+(?:\[\d+\])?$/.test(name);
}