import { IaGetSessionParams } from "./IaParams";
import { IaBaseMetadataType, IaMetadataValidFieldType, IaQueryOutput, IaScope, IaSortOption, Prettify } from "./IaTypes";

export type IaFullTextSearchResult = {
    hits: {
        hits: IaFullTextSearchResultHitItem[],
        total: number;
        max_score: number;
    };
    "ia-pub-fts-api-wrapper": boolean,
    aggregations: {
        "top-collection": IaFullTextSearchResultAggregation,
        "top-mediatype": IaFullTextSearchResultAggregation,
        "top-year": IaFullTextSearchResultAggregation,
        "top-subject": IaFullTextSearchResultAggregation,
        "top-languages": IaFullTextSearchResultAggregation,
        "top-creator": IaFullTextSearchResultAggregation;
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

export type IaFullTextSearchResultAggregation = {
    sum_other_doc_count: number,
    doc_count_error_upper_bound: number,
    buckets: {
        doc_count: number,
        key: string;
    }[];
};

export type IaFullTextSearchResultHitItem = {
    _index: string,
    fields: {
        identifier: string | [string];
    } & IaBaseMetadataType;
    _type: string,
    _score: number,
    highlight: {
        text: string[];
    },
    _id: string;
};


/**
 * Represents a response by the `/services/search/v1/fields`
 * endpoint
 * @see {@link https://archive.org/services/swagger/?url=%2Fservices%2Fsearch%2Fv1%2Fswagger.yaml#!/meta/get_fields}
 */
export type IaGetFieldsResult = {
    fields: string[];
};

type IaBaseSearchParams = {
    maxRetries?: number;
    limit?: number;
};

export type IaScrapeSearchConstructorParams<F extends string[] | undefined> = Prettify<{
    fields?: F,
    sorts?: [] | [IaSortOption] | [IaSortOption, IaSortOption] | [IaSortOption, IaSortOption, IaSortOption],
} & IaBaseSearchParams & Pick<IaScrapeSearchParams, 'scope' | 'count'>>;

// TODO fields optional
export type IaAdvancedSearchConstructorParams = Prettify<{
    fields?: string[],
    sorts?: [] | [IaSortOption] | [IaSortOption, IaSortOption] | [IaSortOption, IaSortOption, IaSortOption],
} & IaBaseSearchParams & Pick<IaAdvancedSearchParams, 'scope' | 'rows'>>;

export type IaFullTextSearchConstructorParams = Prettify<{
    /**
     * Enable Domain-Specific Query language
     * @default false
     */
    dslFts?: boolean,
} & IaBaseSearchParams & Pick<IaFullTextSearchParams, 'scope' | 'size'>>;

export type IaSearchItemsParams = Prettify<IaAdvancedSearchConstructorParams & IaGetSessionParams>;


export type IaScrapeSearchParams = {
    q: string,
    /**
     * The scope of the query. 
     * Possible values are `'standard'` or `'all'`.
     * The `'all'` scope requires authorization
     * @default "standard"
     */
    scope?: IaScope,
    /**
     * Specifies how many results to return per page, positive integer
     * @min 100
     * @max 10000
     */
    count?: number;
    /**
     * Return no items, only total number of items found
     */
    total_only?: boolean,
    /**
     * Optional cursor to continue fetching items from a previous result
     */
    cursor?: string,
    /**
     * Query output, must be set to "json" for API client requests
     */
    output?: IaQueryOutput,
    /**
     * List of fields to return. Field "identifier" is always included
     */
    fields?: string,
    /**
     * Up to 3 sort fields
     * @see {IaSortOption}
     */
    sorts?: string;
};

export type IaAdvancedSearchParams = {
    q: string,
    /**
     * The scope of the query. 
     * Possible values are `'standard'` or `'all'`.
     * The `'all'` scope requires authorization
     */
    scope?: IaScope,
    /**
     * Specifies how many results to return per page, positive integer
     * @min 100
     * @max 10000
     */
    size?: number,
    from?: number,
    total_only?: boolean,
    cursor?: string,
    scroll?: boolean,
    page?: number,
    rows?: number,
    output?: IaQueryOutput,
    [key: `sort[${number | string}]`]: string,
    [key: `fl[${number | string}]`]: string,
};

export type IaFullTextSearchParams = {
    q: string,
    /**
     * The scope of the query. 
     * Possible values are `'standard'` or `'all'`.
     * The `'all'` scope requires authorization
     */
    scope?: IaScope,
    /**
     * Specifies how many results to return per page, positive integer
     * @min 100
     * @max 10000
     */
    size?: number,
    from?: number,
};

export type IaUserAggsSearchParams = Pick<IaAdvancedSearchParams, 'q' | 'page' | 'rows'> & {
    user_aggs: string;
};
