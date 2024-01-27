import { parseIaUtcDate } from "./parseIaUtcDate";
import { IaItemReviewRaw, IaItemReview, IaItemReviewRating } from "../types/IaItemReview";


export function convertIaItemReview(review: IaItemReviewRaw): IaItemReview {
    return {
        ...review,
        stars: parseInt(review.stars) as IaItemReviewRating,
        reviewdate: parseIaUtcDate(review.reviewdate),
        createdate: parseIaUtcDate(review.createdate)
    } as IaItemReview;
}
