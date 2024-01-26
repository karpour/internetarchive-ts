

// Utility types

import { IaTaskPriority } from "./IaTask";

export type NoUnderscoreString<T extends string> =
  T extends `${infer Prefix}_${infer Suffix}` ?
  `${Prefix}--${NoUnderscoreString<Suffix>}`
  : T;

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;


// Metadata types

export type RawMetadata<T extends IaBaseMetadataType> = { [K in keyof T]: StringOrStringArray<T[K]>; };

export type RawifiedMetadata<T extends IaBaseMetadataType> = Prettify<DeepFlatten<FlattenedArrays<IaMetadataRaw<T>>>>;

export type RawMetadataOptional<T extends Record<string, any> | undefined> = T extends undefined ? { [K in keyof T]: StringOrStringArray<T[K]>; } | undefined : { [K in keyof T]: StringOrStringArray<T[K]>; };

export type IaMetadataValidFieldType = string | number | undefined | boolean;

export type IaBaseMetadataType = {
  [key: string]: IaMetadataValidFieldType | string[];
};

export type IaRawMetadataType = {
  [key: string]: string | string[];
};

export type IaRawRawMetadataType = {
  [key: string]: string;
};

export type IaMetadataRaw<T extends IaBaseMetadataType> = {
  [K in keyof T]: T[K] extends IaMetadataValidFieldType ? `${T[K]}` : (T[K] extends string[] ? T[K] : never);
} & {};

export type IaPatchData = ({
  '-patch': string;
  '-target': IaRequestTarget,
} | {
  '-changes': string;
}) & {
  'priority': IaTaskPriority,
};

export const IA_CURATION_STATES = ["dark", "approved", "freeze", "un-dark"] as const;

export type IaCurationState = typeof IA_CURATION_STATES[number];

export type IaCuration = `[curator]${string}[/curator][date]${string}[/date]${`[state]${IaCurationState}[/state]` | ''}[comment]${string}[/comment]`;

export type IaParsedCuration<T extends IaCuration> = Prettify<T extends `[curator]${infer Curator extends string}[/curator][date]${string}[/date]${`[state]${infer State extends string}[/state]` | ''}[comment]${infer Comment extends string}[/comment]` ?
  {
    curator: Curator,
    date: Date,
    comment: Comment;
  } & (State extends IaCurationState ?
    { state: State; } :
    { state: undefined; }
  ) : never>;


// Types for testing

type AssertEqual<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? T : never;

/** Trigger a compiler error when a value is _not_ an exact type. */
declare const exactType: <T, U>(draft: T & AssertEqual<T, U>, expected: U) => U;

// HTTP Types

/** HTTP Methods used in this library */
export type HttpMethod = 'GET' | 'OPTIONS' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';



export function replaceUnderScores<T extends string>(str: T): NoUnderscoreString<T> {
  return str.replaceAll('_', "--") as NoUnderscoreString<T>;
}

export type IaFileObject = { name: string, fileData: Buffer | string; };

export function isIaFileObject(item: unknown): item is IaFileObject {
  return item instanceof Object && (item as any).name && (item as any).filePath;
}

/** File source, indicates whether the file is an original file, a derivative from an original file or metadata */
export type IaFileSource = "original" | "derivative" | "metadata";

/** Common file formats */
export type IaFileFormat = 'JPEG' | 'JPEG Thumb' | 'Archive BitTorrent' | 'MPEG2' | string;

/** Image rotation, usually one of "0", "90", "180", "270" */
export type IaFileRotation = "0" | "90" | "180" | "270";

/** Collection ID */
export type IaCollectionId = string;

/** Item ID */
export type IaItemId = string;


type IaSortOptionsType = {
  readonly [key: string]: IaSortOption;
};

const IA_SORTABLE_FIELDS = [
  "__random",
  "__sort",
  "addeddate",
  "avg_rating",
  "call_number",
  "createdate",
  "creatorSorter",
  "creatorSorterRaw",
  "date",
  "downloads",
  "foldoutcount",
  "headerImage",
  "identifier",
  "identifierSorter",
  "imagecount",
  "indexdate",
  "item_size",
  "languageSorter",
  "licenseurl",
  "mediatype",
  "mediatypeSorter",
  "month",
  "nav_order",
  "num_reviews",
  "programSorter",
  "publicdate",
  "reviewdate",
  "stars",
  "titleSorter",
  "titleSorterRaw",
  "week",
  "year"
] as const;

export type IaSortableField = typeof IA_SORTABLE_FIELDS[number];

export type IaSortOption = `${IaSortableField} asc` | `${IaSortableField} desc`;

export type IaQueryOutput = "json" | "xml" | "csv" | "tables" | "rss";

export const IA_QUERY_FIELDS = [
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
  "headerImage",
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

export type IaQueryField = typeof IA_QUERY_FIELDS[number];

export const IA_DATE_RANGES = [
  "addeddate",
  "createdate",
  "date",
  "indexdate",
  "publicdate",
  "reviewdate",
  "updatedate",
  "oai_updatedate"
] as const;

export type IaDateRange = typeof IA_DATE_RANGES[number];

/** 
 * All possible media types
 * {@link https://archive.org/services/docs/api/metadata-schema/index.html#mediatype }
 */
export const IA_MEDIA_TYPES = [
  "account",
  "audio",
  "collection",
  "image",
  "movies",
  "texts",
  "web",
  "software",
  "data",
  "etree"
] as const;

/** 
 * Media type
 * {@link https://archive.org/services/docs/api/metadata-schema/index.html#mediatype }
 */
export type IaMediaType = typeof IA_MEDIA_TYPES[number];


export interface ItemQueryObject {
  /** Query */
  q: string;
  fl?: IaQueryField[];
  sort?: [IaSortOption] | [IaSortOption, IaSortOption] | [IaSortOption, IaSortOption, IaSortOption];
  rows: number;
  page?: number;
  save?: "yes" | "no";
  output: IaQueryOutput;
  callback?: string;
}

export interface SearchQueryObject extends ItemQueryObject {
  fl: IaQueryField[];
}

export interface IaSearchResponse {
  responseHeader: {
    status: number,
    QTime: number,
    params: {
      query: string,
      qin: string,
      fields: string,
      wt: IaQueryOutput,
      rows: number,
      start: number;
    };
  };
  response: {
    numFound: number,
    start: number,
    docs: SearchResultDoc[];
  };
}

export type SearchResultDoc = {
  [P in IaQueryField]?: string;
};

/**
 * Get Tasks Basic Query Parameters
 * @see {@link https://archive.org/services/docs/api/tasks.html | Tasks API}
 */
export type IaGetTasksBasicParams = {
  /** task identifier */
  task_id?: number;
  /** IA node task will or was executed upon (may be wildcarded) */
  server?: string;
  /** Task command (e.g., archive.php, modify_xml.php, etc.; may be wildcarded) */
  cmd?: string;
  /** Argument list (see below; may be wildcarded) */
  args?: string;
  /** User submitting task (may be wildcarded) */
  submitter?: string;
  /** Generally from 10 to -10 */
  priority?: number;
  /** Task run state (see below) */
  wait_admin?: number;

  'submittime>'?: Date;
  'submittime<'?: Date;
  'submittime>='?: Date;
  'submittime<='?: Date;

  /** The current default is 50 tasks per request, but the caller may request more with the limit parameter 
   * The current maximum limit is 500 tasks. Values outside this range are clamped to the server maximum.
   * If the caller wishes to receive all tasks in a single round-trip, they may set limit=0 in the request query.
   * @default 50
   * 
  */
  limit?: number;

  cursor?: string;
};


/**
 * Params for the {@link Catalog.getTasks} method
 * @see {@link https://archive.org/services/docs/api/tasks.html | Tasks API}
 */
export type IaGetTasksParams = Prettify<IaGetTasksBasicParams & {
  /** 
   * Total counts of catalog tasks meeting all criteria organized by 
   * run status (queued, running, error, and paused). 
   * Historical totals are currently unavailable.
   * @default 1
   */
  summary?: 0 | 1;
  /** A list of all active tasks (queued, running, error, or paused) matching the supplied criteria */
  catalog?: 0 | 1;
  /** A list of all completed tasks matching the supplied criteria */
  history?: 0 | 1;
  /** 
   * The item identifier, if provided will return tasks 
   * for only this item filtered by other criteria provided in params.
   */
  identifier?: string;
}>;



export type IaAuthConfig = {
  s3: {
    'access'?: string;
    'secret'?: string;
  },
  cookies: {
    'logged-in-user'?: string;
    'logged-in-sig'?: string;
    [key: string]: string | undefined;
  },
  general: {
    'screenname'?: string;
    'host'?: string;
    'secure'?: boolean;
  };
  logging?: {
    level?: string;
    file?: string;
  };
};

export type IaAuthConfigSectionName = keyof IaAuthConfig;

export const IA_ITEM_TAB_URL_TYPES = [
  'about',
  'collection'
] as const;

export type IaItemTabUrlType = typeof IA_ITEM_TAB_URL_TYPES[number];

export const IA_ITEM_URL_TYPES = [
  'details',
  'metadata',
  'download',
  'history',
  'edit',
  'editxml',
  'manage',
] as const;

export type IaItemUrlType = typeof IA_ITEM_URL_TYPES[number];

export type HttpHeaders = Record<string, string>;

export type HttpParams = Record<string, string>;

// TODO
export type IaUserInfo = Record<string, string>;


export type IaMetadataRequestTarget = "metadata";
export type IaFileRequestTarget = `files/${string}`;
export type IaCustomJsonRequestTarget = string;

export type IaRequestTarget = IaMetadataRequestTarget | IaFileRequestTarget | IaCustomJsonRequestTarget;

export type StringOrStringArray<T> = T extends any[] ? string | string[] : string;



export type IaFixerOp = string;

export type IaFixerData = Prettify<{
  args?: { [key: string]: '1'; };
} & {
  [key: string]: string;
}>;

export type IaItemDeleteReviewParams =
  { username: string, screenname?: string, itemname?: string; } |
  { username?: string, screenname: string, itemname?: string; } |
  { username?: string, screenname?: string, itemname: string; };

export type IaCheckIdentifierResponse = {
  identifier: string,
  type: "success",
  code: "invalid" | "not_available" | "available",
  message: string;
} | {
  type: "error",
  message: string;
};

// Types to Flatten arrays in items

/** 
 * Converts an array index to a flat key using the provided KEY parameter
 * 
 * If IDX is zero, the type will be just be KEY.
 * If IDX is above zero, the resulting type will be `${KEY}[${IDX}]`.
 * @example
 * FlattenedArrayKey<"a", 1> // results in "a[1]"
 * @template {string} KEY Key name
 * @template {number} IDX Array index
 */
type FlattenedArrayKey<KEY extends string, IDX extends `${number}`> = IDX extends 0 ? KEY : `${KEY}[${IDX}]`;

type AddFlattenedKeys<KEY extends string, T extends string[]> = {
    [K in keyof T as K extends `${0}` ? KEY : (K extends `${number}` ? FlattenedArrayKey<KEY, K> : never)]: T[K];
} & {};

type FlattenedArrays<T extends { [key: string]: string | string[]; }> = {
    [K in keyof T]: T[K] extends string[] ? (
        K extends string ?
        AddFlattenedKeys<K, T[K]> :
        never
    ) : T[K];
};

type ValuesOf<T> = T[keyof T];
type ObjectValuesOf<T> = Exclude<
    Extract<ValuesOf<T>, object>,
    Array<any>
>;

type UnionToIntersection<U> = (U extends any
    ? (k: U) => void
    : never) extends ((k: infer I) => void)
    ? I
    : never;

type NonObjectKeysOf<T> = {
    [K in keyof T]: T[K] extends Array<any> ?
    K :
    T[K] extends object ? never : K
}[keyof T];

// DeepFlatten utility types
type DFBase<T, Recursor> = Pick<T, NonObjectKeysOf<T>> & UnionToIntersection<Recursor>;
type DeepFlatten<T> = T extends any ? DFBase<T, DF2<ObjectValuesOf<T>>> : never;
type DF2<T> = T extends any ? DFBase<T, ObjectValuesOf<T>> : never;