
export type IaItemReviewRating = 0 | 1 | 2 | 3 | 4 | 5;

export type IaItemPostReviewBody = {
    title: string,
    body: string,
    stars: IaItemReviewRating;
};

export type IaItemReview = {
    /** Multiline text */
    reviewbody: string;
    /** A single line of text */
    reviewtitle: string;
    /** The user's screenname (not username/email) */
    reviewer: string;
    /**
     * The user's item
     * @example "@joe_example"
     */
    reviewer_itemname?: `@${string}`;
    /** Date and time (UTC) of when the review was last edited */
    reviewdate: string;
    /** Date and time (UTC) of when the review was first submitted */
    createdate: string;
    /** From 0 (zero) to 5 (five) */
    stars: `${IaItemReviewRating}`;
};

export type IaItemReviewParsed = {
    /** Multiline text */
    reviewbody: string;
    /** A single line of text */
    reviewtitle: string;
    /** The user's screenname (not username/email) */
    reviewer: string;
    /**
     * The user's item
     * @example "@joe_example"
     */
    reviewer_itemname?: `@${string}`;
    /** Date and time (UTC) of when the review was last edited */
    reviewdate: Date;
    /** Date and time (UTC) of when the review was first submitted */
    createdate: Date;
    /** From 0 (zero) to 5 (five) */
    stars: IaItemReviewRating;
};