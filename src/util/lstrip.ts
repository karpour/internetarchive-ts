import { IaTypeError } from "../error";

/**
 * Removes all occurences of `charToStrip` from `str`
 * @param str Input string
 * @param charToStrip Char to remove
 * @returns String with characters removed. Unchanged string if string did not star with `charToStrip`
 */
export function lstrip(str: string, charToStrip: string) {
    if (charToStrip.length !== 1) {
        throw new IaTypeError(`charToStrip must be a single character`);
    }
    while (str.startsWith(charToStrip)) {
        str = str.substring(1);
    }
    return str;
}