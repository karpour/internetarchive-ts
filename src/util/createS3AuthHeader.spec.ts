import { expect } from "chai";
import { IaTypeError } from "../error";
import { createS3AuthHeader } from "./createS3AuthHeader";

describe('createS3AuthHeader.ts', () => {
    it('createS3AuthHeader', async () => {
        const accessKey = 'abc';
        const secretKey = 'def';

        expect(createS3AuthHeader(accessKey, secretKey)).to.deep.equal({
            Authorization: `LOW ${accessKey}:${secretKey}`
        });

        expect(() => createS3AuthHeader(accessKey, "")).to.throw(IaTypeError);
        expect(() => createS3AuthHeader(accessKey, undefined as any)).to.throw(IaTypeError);
        expect(() => createS3AuthHeader("", secretKey)).to.throw(IaTypeError);
        expect(() => createS3AuthHeader(undefined as any, secretKey)).to.throw(IaTypeError);
    });
});