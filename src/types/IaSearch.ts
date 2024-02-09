import { TODO } from "../todotype";

export type IaFullTextSearchResult = {
    _scroll_id?: string,
    hits: {
        hits: IaFullTextSearchResultHitItem[],
        total: number;
        max_score: number;
    };
    "ia-pub-fts-api-wrapper": boolean,
    aggregations: {
        "top-collection": TODO,
        "top-mediatype": TODO,
        "top-year": TODO,
        "top-subject": TODO,
        "top-languages": TODO,
        "top-creator": TODO;
    };
    took: number,
    "fts-api": {
        "logged-in-user": string,
        host: string,
        "logged-in-sig": string,
        version: string,
        auth: {
            email: string,
            context_scope: string,
            type: "cookies" | "S3" | string;
        },
        commit: string,
        query_type: "dsl" | "lucene" | string,
        cached: boolean;
    },
    timed_out: boolean;
};

export type IaFullTextSearchResultHitItem = {
    _index: string,
    fields: {
        identifier: string | [string];
        [key: string]: TODO;
    },
    _type: string,
    _score: number,
    highlight: {
        text: string[];
    },
    _id: string;
};

