import { expect } from 'chai';
import { validateIaIdentifier } from './validateIaIdentifier.js';
import { IaTypeError } from '../error/index.js';

describe('validateIaIdentifier.ts', () => {
    it('validateIaIdentifier', async () => {
        for (const validIdentifier of validIdentifiers) {
            expect(() => validateIaIdentifier(validIdentifier), validIdentifier).to.not.throw;
        }
        for (const invalidIdentifier of invalidIdentifiers) {
            expect(() => validateIaIdentifier(invalidIdentifier), invalidIdentifier).to.throw(IaTypeError);
        }
    });
});

const validIdentifiers = [
    "abc",
    "AbC",
    "0abc",
    "abc_",
    "444abc",
    "1234",
    "44453345._-"
];

const invalidIdentifiers = [
    ".abc",
    "---",
    "___",
    "...",
    "ab",
    "012345678901234567890123456789012345678901234567890123456789012345678901234567891" // 81 chars
];