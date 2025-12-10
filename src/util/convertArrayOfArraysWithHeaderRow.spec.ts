import { expect } from 'chai';
import { convertArrayOfArraysWithHeaderRow } from './convertArrayOfArraysWithHeaderRow.js';

describe('convertArrayOfArraysWithHeaderRow.ts', () => {
    it('convertArrayOfArraysWithHeaderRow', async () => {
        expect(convertArrayOfArraysWithHeaderRow([
            ["col1", "col2"],
            ["val", "val2"],
            ["val3", "val4"],
        ])).to.deep.equal([{ col1: 'val', col2: 'val2' }, { col1: 'val3', col2: 'val4' }]);
    });
});