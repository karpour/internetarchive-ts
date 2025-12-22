import { IaSearchResultMetaItem } from "./IaItemMetadata.js";
import { IaGetSessionParams } from "./IaParams.js";
import { IaBaseMetadataType, IaQueryOutput, IaScope, IaSortOption, Prettify } from "./IaTypes.js";

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

export type IaBaseSearchParams = {
    maxRetries?: number;
    limit?: number;
};

export type IaScrapeSearchConstructorParams<F extends string[] | undefined> = Prettify<{
    fields?: F,
    sorts?: [] | [IaSortOption] | [IaSortOption, IaSortOption] | [IaSortOption, IaSortOption, IaSortOption],
} & IaBaseSearchParams & Pick<IaScrapeSearchParams, 'scope' | 'count'>>;

export type IaAdvancedSearchConstructorParams<F extends string[] | undefined> = Prettify<{
    fields?: F,
    sorts?: [] | [IaSortOption] | [IaSortOption, IaSortOption] | [IaSortOption, IaSortOption, IaSortOption],
} & IaBaseSearchParams & Pick<IaAdvancedSearchParams, 'scope' | 'rows'>>;

export type IaFullTextSearchConstructorParams = Prettify<{
    /**
     * Enable Domain-Specific Query language
     * @default false
     */
    dslFts?: boolean,
} & IaBaseSearchParams & Pick<IaFullTextSearchParams, 'scope' | 'size'>>;

export type IaSearchAdvancedParams<F extends string[] | undefined> = Prettify<IaAdvancedSearchConstructorParams<F> & IaGetSessionParams>;


export type IaScrapeSearchParams = {
    /**
     * Query string
     */
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
    /**
     * 
     */
    from?: number,
    /**
     * 
     */
    total_only?: boolean,
    /**
     * 
     */
    cursor?: string,
    /**
     * 
     */
    scroll?: boolean,
    /**
     * 
     */
    page?: number,
    /**
     * 
     */
    rows?: number,
    /**
     * 
     */
    output?: IaQueryOutput,
    /**
     * 
     */
    [key: `sort[${number | string}]`]: string,
    /**
     * 
     */
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
    user_aggs_size?: number;
};

export type IaScrapeSearchResult<Fields extends string> = {
    items: IaSearchResultMetaItem<Fields>[],
    count: number,
    total: number;
    cursor?: string;
};

export type SearchFields<Fields extends readonly string[] | undefined> = (Fields extends readonly string[] ? Fields[number] : 'identifer') | 'identifier';


/**
 * List of fields that can be aggregated
 */
export const IA_AGGREGATABLE_FIELDS = [
    'mediatype',
    'addeddate',
    'publicdate',
    'collection',
    'date',
    'uploader',
    'subject',
    'contributor',
    'imagecount',
    'public_format',
    'updatedate',
    'foldoutcount',
    'related_external_id',
    'licenseurl',
    'bookreader_defaults',
    'openlibrary_edition',
    'openlibrary_work',
    'call_number',
    'isbn',
    'condition_visual',
    'type',
    'year'
] as const;

/**
 * Type that includes all fields that can be aggregated for use in {@link IaAdvancedSearch | advanced search}
 */
export type IaAggregatableField = Prettify<typeof IA_AGGREGATABLE_FIELDS[number]>;

export type IaUserAggs<T extends IaAggregatableField[]> = {
    [key in T[number]]: IaUserAggsItem;
};

export type IaUserAggsItem = {
    doc_count_error_upper_bound: number,
    sum_other_doc_count: number,
    buckets: {
        key: number,
        key_as_string: string,
        doc_count: number;
    };
};

// TODO Define this type
export type IaDefaultAdvancedSearchResultItem = {
    avg_rating?: number,
    backup_location?: string;
    btih?: string,
    collection: string | string[],
    creator: string | string[],
    date?: IsoStringDateTime,
    description: string,
    downloads: number,
    format: string | string[],
    identifier: string,
    indexflag: string | string[],
    item_size: number,
    language?: string | string[],
    mediatype: string | string[],
    month: number,
    num_reviews?: number,
    oai_updatedate: IsoStringDateTime | IsoStringDateTime[],
    publicdate: IsoStringDateTime,
    reviewdate?: IsoStringDateTime,
    subject: string | string[],
    title: string,
    week: number,
    year?: number;
};

export type IsoStringDateTime = `${number}-${number}-${number}T${number}:${number}:${number}Z`;


export type IaAdvancedSearchResult<F extends readonly string[] | undefined = undefined, U extends readonly string[] | undefined = undefined> = {
    responseHeader: {
        status: number,
        QTime: number,
        params: {
            query: string,
            qin: string,
            fields: string,
            wt: string,
            sort: string,
            rows: `${number}`,
            start: number;
        };
    },
    response: {
        numFound: number,
        start: number,
        docs: (F extends readonly string[] ?
            IaSearchResultMetaItem<F[number] | "identifier">[] :
            IaDefaultAdvancedSearchResultItem[]);
    } & (U extends readonly string[] ? {
        aggregations: {
            [key in `user_aggs__terms__field:${U extends readonly string[] ? U[number] : never}__size:${number}`]: IaUserAggsItem
        };
    } : {});
};
