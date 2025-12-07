import { expect } from 'chai';
import { getMd5 } from './getMd5.js';

const TEXT_FILE_PATH = './testdata/test.txt';
const MD5 = '6620a05883a0fda6b569b71c8b209846';

describe('getMd5FromFile.ts', () => {
    it('getMd5FromFile', async () => {
        const hash = await getMd5(TEXT_FILE_PATH);
        expect(hash).to.equal(MD5);
    });
});