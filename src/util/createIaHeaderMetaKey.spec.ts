import { expect } from "chai";
import { IaTypeError } from "../error/index.js";
import { createIaHeaderMetaKey } from "./createIaHeaderMetaKey.js";

describe('createIaHeaderMetaKey.ts', () => {
    it('createIaHeaderMetaKey', async () => {
        expect(createIaHeaderMetaKey("keyname", "meta", 1)).to.equal("x-archive-meta01-keyname");
        expect(createIaHeaderMetaKey("keyname", "meta", 99)).to.equal("x-archive-meta99-keyname");
        expect(createIaHeaderMetaKey("keyname", "meta", 999)).to.equal("x-archive-meta999-keyname");
        expect(createIaHeaderMetaKey("keyname", "meta")).to.equal("x-archive-meta-keyname");
        expect(createIaHeaderMetaKey("keyname", "filemeta", 1)).to.equal("x-archive-filemeta01-keyname");
        expect(createIaHeaderMetaKey("keyname", "filemeta")).to.equal("x-archive-filemeta-keyname");
        expect(() => createIaHeaderMetaKey("keyname", "meta", -1)).to.throw(IaTypeError);
        expect(() => createIaHeaderMetaKey("keyname", "meta", 2.34)).to.throw(IaTypeError);
        expect(() => createIaHeaderMetaKey("keyname", "meta", null as any)).to.throw(IaTypeError);
    });
});