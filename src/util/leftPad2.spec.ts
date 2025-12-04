import { expect } from 'chai';
import { getMd5 } from './getMd5';
import { leftPad2 } from './leftPad2';
import { IaTypeError } from '../error';

const TEXT_FILE_PATH = './testdata/test.txt';
const MD5 = '6620a05883a0fda6b569b71c8b209846';

describe('leftPad2.ts', () => {
    it('leftPad2', async () => {
        expect(leftPad2(1)).to.equal("01");
        expect(leftPad2(9)).to.equal("09");
        expect(leftPad2(0)).to.equal("00");
        expect(leftPad2(10)).to.equal("10");
        expect(leftPad2(99)).to.equal("99");
        expect(() => leftPad2(-99)).to.throw(IaTypeError);
        expect(() => leftPad2(NaN)).to.throw(IaTypeError);
        expect(() => leftPad2(0.5)).to.throw(IaTypeError);
        expect(() => leftPad2(99.999)).to.throw(IaTypeError);
    });
});