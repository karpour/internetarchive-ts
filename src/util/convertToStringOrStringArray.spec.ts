import { expect } from "chai";
import { convertToStringOrStringArray } from "./convertToStringOrStringArray";
import { IaTypeError } from "../error";

describe('convertToStringOrStringArray.ts', () => {
    it('convertToStringOrStringArray', async () => {
        expect(convertToStringOrStringArray(1)).to.equal("1");
        expect(convertToStringOrStringArray(true)).to.equal("true");
        expect(convertToStringOrStringArray("1")).to.equal("1");
        expect(convertToStringOrStringArray(undefined)).to.equal(undefined);
        expect(convertToStringOrStringArray([1, 2, true, "3"])).to.deep.equal(["1", "2", "true", "3"]);

        expect(() => convertToStringOrStringArray({ a: 1 } as any)).to.throw(IaTypeError);
        expect(() => convertToStringOrStringArray((() => 123) as any)).to.throw(IaTypeError);
        expect(() => convertToStringOrStringArray(Symbol("a") as any)).to.throw(IaTypeError);
    });
});