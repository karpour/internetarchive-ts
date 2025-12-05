import { expect } from 'chai';
import { stripSingle } from './stripSingle';

describe('stripSingle.ts', () => {
    it('stripSingle', async () => {
        expect(stripSingle(["123", "456"])).to.equal("123");
        expect(stripSingle(["123"])).to.equal("123");
        expect(stripSingle("123")).to.equal("123");
    });
});
