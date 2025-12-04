import { expect } from 'chai';
import { IaTypeError } from '../error';
import { lstrip } from './lstrip';

describe('lstrip.ts', () => {
    it('lstrip', async () => {
        expect(lstrip("////aaa", "/")).to.equal("aaa");
        expect(lstrip("aaa", "a")).to.equal("");
        expect(lstrip(".test", ".")).to.equal("test");
        expect(() => lstrip("////aaa", "////")).to.throw(IaTypeError);
    });
});