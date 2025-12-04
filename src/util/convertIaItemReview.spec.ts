import { expect } from 'chai';
import { convertIaItemReview } from './convertIaItemReview';
import { IaItemReview } from '../types';
import { dateToYYYYMMDDHHMMSS } from './dateToYYYYMMDDHHMMSS';

describe('convertIaItemReview.ts', () => {
    it('convertIaItemReview', async () => {
        const review: IaItemReview = {
            "reviewbody": "TEST TEXT",
            "reviewtitle": "Inclusion in Images collection",
            "reviewer": "Author",
            "reviewdate": "2016-12-15 02:46:27",
            "createdate": "2015-09-01 05:32:25",
            "stars": "3"
        };
        const parsedReview = convertIaItemReview(review);
        expect(parsedReview.reviewbody).to.equal("TEST TEXT");
        expect(parsedReview.reviewtitle).to.equal("Inclusion in Images collection");
        expect(parsedReview.reviewer).to.equal("Author");
        expect(dateToYYYYMMDDHHMMSS(parsedReview.reviewdate)).to.equal("2016-12-15 02:46:27");
        expect(dateToYYYYMMDDHHMMSS(parsedReview.createdate)).to.equal("2015-09-01 05:32:25");
        expect(parsedReview.stars).to.equal(3);
    });
});