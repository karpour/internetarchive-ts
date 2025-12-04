import { parseIaUtcDate } from "./parseIaUtcDate";
import { IaItemReview, IaItemReviewRating, IaItemReviewParsed } from "../types/IaItemReview";

/**
 * Returns a review object where stars are converted to a number and dates are converted to Date objects
 * @param review Review to convert
 * @returns Converted review
 */
export function convertIaItemReview(review: IaItemReview): IaItemReviewParsed {
    return {
        ...review,
        stars: parseInt(review.stars) as IaItemReviewRating,
        reviewdate: parseIaUtcDate(review.reviewdate),
        createdate: parseIaUtcDate(review.createdate)
    };
}
