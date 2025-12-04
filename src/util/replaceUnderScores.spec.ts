import { expect } from 'chai';
import { replaceUnderScores } from './replaceUnderScores';

describe('replaceUnderScores.ts', () => {
    it('replaceUnderScores', async () => {
        const underScoreString = "a_b__c";
        const replacedString = replaceUnderScores(underScoreString);
        const replacedString2: typeof replacedString = "a--b----c";
        expect(replacedString).to.equal(replacedString2);

        expect(replaceUnderScores("abc")).to.equal("abc")
        expect(replaceUnderScores("")).to.equal("")
        expect(replaceUnderScores("_")).to.equal("--")
        expect(replaceUnderScores("_a_a_")).to.equal("--a--a--")
    });
});