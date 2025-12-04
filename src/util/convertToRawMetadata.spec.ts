
import { expect } from "chai";
import { IaBaseMetadataType } from "../types";
import { convertToRawMetadata } from "./convertToRawMetadata";
import { IaTypeError } from "../error";

describe('convertToRawMetadata.ts', () => {
    it('convert raw metadata', async () => {
        const metadata: IaBaseMetadataType = {
            a: 1,
            b: "a",
            c: [1, "b", true]
        };

        expect(convertToRawMetadata(metadata)).to.deep.equal({
            a: "1",
            b: "a",
            c: ["1", "b", "true"]
        });
    });

    it('convert illegal metadata', async () => {
        const metadata: IaBaseMetadataType = {
            a: 1,
            b: { a: 1} as any,
            c: [1, "b", true]
        };

        expect(() => convertToRawMetadata(metadata)).to.throw(IaTypeError);
    });
});