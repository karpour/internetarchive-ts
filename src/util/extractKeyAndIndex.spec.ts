import { expect } from "chai";
import { extractKeyAndIndex } from "./extractKeyAndIndex.js";
import { IaTypeError } from "../error/index.js";

describe('extractKeyAndIndex.ts', () => {
    it('extractKeyAndIndex', async () => {
        expect(extractKeyAndIndex("abc[01]")).to.deep.equal(["abc", 1]);
        expect(extractKeyAndIndex("abc")).to.deep.equal(["abc", undefined]);
        expect(extractKeyAndIndex("abc[101]")).to.deep.equal(["abc", 101]);

        const invalidKeys = [
            "[101]",
            "aaa[101",
            ""
        ];

        for(const invalidKey of invalidKeys) {
            expect(() => extractKeyAndIndex(invalidKey),invalidKey).to.throw(IaTypeError);
        }
    });
});