import { Optional, Prettify } from "./IaTypes";

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


type IaSearchField = typeof IA_SEARCH_FIELDS[number];


export const fields = ["aa", "bbb", "item_size"] as const;

export type IaSearchResponseItem<FieldNames extends readonly string[] | string[] = string[]> = Prettify<
    { [key in Exclude<FieldNames[number],IaNeverUndefinedSearchResultFields>]?: IaSearchItemValue<key> } &
    { [key in Extract<FieldNames[number],IaNeverUndefinedSearchResultFields>]: IaSearchItemValue<key> } &
    {}>;

type test = IaSearchResponseItem<typeof fields>;

function getP<FieldNames extends readonly string[]>(fieldnames: FieldNames): IaSearchResponseItem<FieldNames> {
    return {} as IaSearchResponseItem<FieldNames>;
}


const a = getP(IA_SEARCH_FIELDS);

type A = "a" | "b" | "week";
type B = "week";

type MyType<A extends string, B extends string> = {
    [key in Exclude<A, B>]?: IaSearchItemValue<key>;
} & {
        [key in Extract<A, B>]: IaSearchItemValue<key>
    };



type ResultType = MyType<A, B>;
// What i want:
type ExpectedResultType = {
    a?: string;
    b: string;
    c?: string;
};
