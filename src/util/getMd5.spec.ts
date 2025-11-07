import 'mocha';
import { expect } from 'chai';
import { getMd5 } from './getMd5';

const TEXT_FILE_PATH = './testdata/text.txt';
const MD5 = '6620a05883a0fda6b569b71c8b209846';

describe('util', () => {
    it('getMd5FromFile', async () => {
        const hash = await getMd5(TEXT_FILE_PATH);
        expect(hash).to.equal(MD5);
    });


});