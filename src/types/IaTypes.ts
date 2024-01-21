

// Utility types

export type NoUnderscoreString<T extends string> =
  T extends `${infer Prefix}_${infer Suffix}` ?
  `${Prefix}--${NoUnderscoreString<Suffix>}`
  : T;

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};



/** HTTP Methods used in this library */
export type HttpMethod = 'GET' | 'OPTIONS' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type IaHeaderMetaEntry<T extends string, V extends string> = `x-archive-meta-${NoUnderscoreString<T>}:${V}`;


function replaceUnderScores<T extends string>(str: T): NoUnderscoreString<T> {
  return str.replaceAll('_', "--") as NoUnderscoreString<T>;
}

function createIaHeaderMetaEntry<K extends string, V extends string>(key: K, value: V): IaHeaderMetaEntry<K, V> {
  // TODO replace newlines, trim
  return `x-archive-meta-${replaceUnderScores(key)}:${value}`;
}

type IaAuthHeader<A extends string, S extends string> = { Authorization: `LOW ${A}:${S}`; };

export function createIaAuthHeader<A extends string, S extends string>(s3Access: A, s3Secret: S): IaAuthHeader<A, S> {
  return {
    Authorization: `LOW ${s3Access}:${s3Secret}`
  };
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

export enum IaSortOptions {
  __random_desc = "__random desc",
  __random_asc = "__random asc",
  __sort_desc = "__sort desc",
  __sort_asc = "__sort asc",
  addeddate_desc = "addeddate desc",
  addeddate_asc = "addeddate asc",
  avg_rating_desc = "avg_rating desc",
  avg_rating_asc = "avg_rating asc",
  call_number_desc = "call_number desc",
  call_number_asc = "call_number asc",
  createdate_desc = "createdate desc",
  createdate_asc = "createdate asc",
  creatorSorter_desc = "creatorSorter desc",
  creatorSorter_asc = "creatorSorter asc",
  creatorSorterRaw_desc = "creatorSorterRaw desc",
  creatorSorterRaw_asc = "creatorSorterRaw asc",
  date_desc = "date desc",
  date_asc = "date asc",
  downloads_desc = "downloads desc",
  downloads_asc = "downloads asc",
  foldoutcount_desc = "foldoutcount desc",
  foldoutcount_asc = "foldoutcount asc",
  headerImage_desc = "headerImage desc",
  headerImage_asc = "headerImage asc",
  identifier_desc = "identifier desc",
  identifier_asc = "identifier asc",
  identifierSorter_desc = "identifierSorter desc",
  identifierSorter_asc = "identifierSorter asc",
  imagecount_desc = "imagecount desc",
  imagecount_asc = "imagecount asc",
  indexdate_desc = "indexdate desc",
  indexdate_asc = "indexdate asc",
  item_size_desc = "item_size desc",
  item_size_asc = "item_size asc",
  languageSorter_desc = "languageSorter desc",
  languageSorter_asc = "languageSorter asc",
  licenseurl_desc = "licenseurl desc",
  licenseurl_asc = "licenseurl asc",
  mediatype_desc = "mediatype desc",
  mediatype_asc = "mediatype asc",
  mediatypeSorter_desc = "mediatypeSorter desc",
  mediatypeSorter_asc = "mediatypeSorter asc",
  month_desc = "month desc",
  month_asc = "month asc",
  nav_order_desc = "nav_order desc",
  nav_order_asc = "nav_order asc",
  num_reviews_desc = "num_reviews desc",
  num_reviews_asc = "num_reviews asc",
  programSorter_desc = "programSorter desc",
  programSorter_asc = "programSorter asc",
  publicdate_desc = "publicdate desc",
  publicdate_asc = "publicdate asc",
  reviewdate_desc = "reviewdate desc",
  reviewdate_asc = "reviewdate asc",
  stars_desc = "stars desc",
  stars_asc = "stars asc",
  titleSorter_desc = "titleSorter desc",
  titleSorter_asc = "titleSorter asc",
  titleSorterRaw_desc = "titleSorterRaw desc",
  titleSorterRaw_asc = "titleSorterRaw asc",
  week_desc = "week desc",
  week_asc = "week asc",
  year_desc = "year desc",
  year_asc = "year asc",
};

export type IaSortOption = `${IaSortOptions}`;

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

export type IaDateRange = typeof IA_DATE_RANGES[number];;

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
 * See {@link https://archive.org/services/docs/api/tasks.html}
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

export type Prettify<T> = {
  [k in keyof T]: T[k];
} & {};

/**
 * Get Tasks Query Parameters
 * See {@link https://archive.org/services/docs/api/tasks.html}
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

export type IaRequestTarget = 'metadata' | 'files' | string;

export type StringOrStringArray<T> = T extends any[] ? string | string[] : string;

export type RawMetadata<T extends Record<string, any> | undefined> = { [K in keyof T]: StringOrStringArray<T[K]>; };

export type RawMetadataOptional<T extends Record<string, any> | undefined> = T extends undefined ? { [K in keyof T]: StringOrStringArray<T[K]>; } | undefined : { [K in keyof T]: StringOrStringArray<T[K]>; };

export type IaFixerOp = string;

export type IaItemDeleteReviewParams =
  { username: string, screenname?: string, itemname?: string; } |
  { username?: string, screenname: string, itemname?: string; } |
  { username?: string, screenname?: string, itemname: string; };