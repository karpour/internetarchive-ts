import { expect } from "chai";
import { IaTypeError } from "../error/index.js";
import { createBasicAuthHeader } from "./createBasicAuthHeader.js";

describe('createBasicAuthHeader.ts', () => {
    it('createBasicAuthHeader', async () => {
        const accessKey = 'abc';
        const secretKey = 'def';
        const base64 = 'YWJjOmRlZg==';

        expect(createBasicAuthHeader(accessKey, secretKey)).to.deep.equal({
            Authorization: `Basic ${base64}`
        });

        expect(() => createBasicAuthHeader(accessKey, "")).to.throw(IaTypeError);
        expect(() => createBasicAuthHeader(accessKey, undefined as any)).to.throw(IaTypeError);
        expect(() => createBasicAuthHeader("", secretKey)).to.throw(IaTypeError);
        expect(() => createBasicAuthHeader(undefined as any, secretKey)).to.throw(IaTypeError);
    });
});