import { expect } from "chai";
import { convertToRawFlattenedMetadata } from "./convertToRawFlattenedMetadata.js";
import { IaBaseMetadataType } from "../types/index.js";
import { IaTypeError } from "../error/index.js";

describe("convertToRawFlattenedMetadata.ts", () => {
    it("convert primitive values to string", () => {
        const input: IaBaseMetadataType = {
            a: 42,
            b: "hello",
            c: true,
            d: 10n as any
        };

        const result = convertToRawFlattenedMetadata(input);

        expect(result).to.deep.equal({
            a: "42",
            b: "hello",
            c: "true",
            d: "10"
        });
    });

    it("array values", () => {
        const input = {
            tags: ["a", "b", "c"]
        };

        const result = convertToRawFlattenedMetadata(input);

        expect(result).to.deep.equal({
            "tags[0]": "a",
            "tags[1]": "b",
            "tags[2]": "c"
        });
    });

    it("throw IaTypeError for null or undefined array items", () => {
        const input = {
            values: [1, undefined, 3]
        };

        expect(() => convertToRawFlattenedMetadata(input)).to.throw(IaTypeError, `Value of values[1] is "undefined"`);
    });

    it("ignore undefined top-level properties", () => {
        const input = {
            a: 1,
            b: undefined
        };

        const result = convertToRawFlattenedMetadata(input);

        expect(result).to.deep.equal({
            a: "1"
        });
    });

    it("ignore object values that are not arrays", () => {
        const input = {
            a: 1,
            obj: { x: 1, y: 2 } as any// Should be ignored 
        };

        expect(() => convertToRawFlattenedMetadata(input)).to.throw(IaTypeError, `illegal value of type "object"`);
    });

    it("throw IaTypeError for invalid types like function", () => {
        const input = {
            a: 1,
            fun: function () { } as any
        };

        expect(() => convertToRawFlattenedMetadata(input)).to.throw(IaTypeError, `illegal value of type "function"`);
    });

    it("throw IaTypeError for symbol types", () => {
        const input = {
            a: Symbol("test") as any
        };

        expect(() => convertToRawFlattenedMetadata(input)).to.throw(IaTypeError, `illegal value of type "symbol"`);
    });
});
