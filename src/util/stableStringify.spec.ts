import { expect } from 'chai';
import stableStringify from './stableStringify';

describe('stableStringify.ts', () => {
    it('stableStringify', async () => {
        const obj1 = {
            a: 1,
            b: 2,
            c: {
                a: 1,
                b: "123"
            },
            d: ["abc", 1, 2, 3]
        };
        const obj2 = {
            b: 2,
            c: {
                b: "123",
                a: 1,
            },
            d: ["abc", 1, 2, 3],
            a: 1,
        };

        const str1Unstable = JSON.stringify(obj1);
        const str2Unstable = JSON.stringify(obj2);
        const str1 = stableStringify(obj1);
        const str2 = stableStringify(obj2);

        expect(str1Unstable).to.not.equal(str2Unstable);
        expect(str1).to.equal(str2);
    });
});
