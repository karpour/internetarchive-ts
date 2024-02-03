import { parseIaUtcDate } from "./parseIaUtcDate";
import { IaItemReview, IaItemReviewRating, IaParsedItemReview } from "../types/IaItemReview";


export function convertIaItemReview(review: IaItemReview): IaParsedItemReview {
    return {
        ...review,
        stars: parseInt(review.stars) as IaItemReviewRating,
        reviewdate: parseIaUtcDate(review.reviewdate),
        createdate: parseIaUtcDate(review.createdate)
    };
}
