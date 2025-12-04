import { IaInvalidIdentifierError } from "../error";

const RegExp_IA_IDENTIFIER = /^[A-Za-z0-9\.][A-Za-z0-9-_\.]{2,79}$/;


/**
 * Validate an Ia identifier
 * @param identifier Identifier to validate
 * @throws {IaInvalidIdentifierError} if identifier is invalid
 * @returns true if identifier is valid
 */
export function validateIaIdentifier(identifier: string): true {
    let vStr = identifier;
    // periods, underscores, and dashes are legal, but may not be the first character!
    if (vStr.startsWith('.') || vStr.startsWith('_') || vStr.startsWith('-')) {
        throw new IaInvalidIdentifierError('Identifier cannot begin with periods ".", underscores "_", or dashes "-".');
    }
    if (vStr.length > 80 || vStr.length < 3) {
        throw new IaInvalidIdentifierError('Identifier should be between 3 and 80 characters in length.');
    }
    // Support for uploading to user items, e.g. first character can be `@`.
    if (!RegExp_IA_IDENTIFIER.test(vStr)) {
        throw new IaInvalidIdentifierError('Identifier can only contain alphanumeric characters, periods ".", underscores "_", or dashes "-". However, identifier cannot begin with periods, underscores, or dashes.');
    }
    return true;
}
