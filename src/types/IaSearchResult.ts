import { Optional, Prettify } from "./IaTypes.js";

export type IaSearchResult<FieldNames extends readonly string[] | string[] = string[]> = Prettify<{
    responseHeader: {
        status: number,
        QTime: number,
        params: {
            query: string,
            qin: string,
            fields: string,
            wt: string,
            rows: string,
            start: number;
        };
    },
    response: {
        numFound: number,
        start: number,
        docs: IaSearchResponseItem<FieldNames>[];
    };
}>;

export const IA_SEARCH_FIELDS = [
    "avg_rating",
    "backup_location",
    "btih",
    "call_number",
    "collection",
    "contributor",
    "coverage",
    "creator",
    "date",
    "description",
    "downloads",
    "external-identifier",
    "foldoutcount",
    "format",
    "genre",
    "identifier",
    "imagecount",
    "indexflag",
    "item_size",
    "language",
    "licenseurl",
    "mediatype",
    "members",
    "month",
    "name",
    "noindex",
    "num_reviews",
    "oai_updatedate",
    "publicdate",
    "publisher",
    "related",
    "reviewdate",
    "rights",
    "scanningcentre",
    "source",
    "stripped_tags",
    "subject",
    "title",
    "type",
    "volume",
    "week",
    "year"
] as const;

type IaNumberSearchResultFields =
    "downloads" |
    "week" |
    "year" |
    "month" |
    "item_size";

type IaNeverUndefinedSearchResultFields =
    "identifier" |
    "item_size";

type IaSearchItemValue<KEY extends string> = KEY extends IaNumberSearchResultFields ? number : string | string[] | number;

export type IaSearchField = typeof IA_SEARCH_FIELDS[number];

export type IaSearchResponseItem<FieldNames extends readonly string[] | string[] = string[]> = Prettify<
    { [key in Exclude<FieldNames[number],IaNeverUndefinedSearchResultFields>]?: IaSearchItemValue<key> } &
    { [key in Extract<FieldNames[number],IaNeverUndefinedSearchResultFields>]: IaSearchItemValue<key> } &
    {}>;