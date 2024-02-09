//
// The internetarchive module is a Python/CLI interface to Archive.org.
//
// Copyright (C) 2012-2019 Internet Archive
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { error } from "console";
import { IaApiError, IaApiRangeError, IaTypeError } from "../error";
import { IaItem } from "../item/IaItem";
import IaSession from "../session/IaSession";
import { TODO } from "../todotype";
import { IaApiJsonErrorResult, IaSortOption } from "../types";
import { IaAdvancedSearchParams, IaAdvancedSearchConstructorParams, IaUserAggsSearchParams } from "../types/IaParams";
import { handleIaApiError } from "../util/handleIaApiError";
import { IA_MAX_SEARCH_RESULT_COUNT, IaBaseSearch } from "./IaBaseSearch";
import { isApiJsonErrorResult } from "../util/isApiJsonErrorResult";


/**
 * internetarchive.search
 * ~~~~~~~~~~~~~~~~~~~~~~
 * 
 * This module provides objects for interacting with the Archive.org
 * search engine.
 * 
 * :copyright: (C) 2012-2019 by Internet Archive.
 * :license: AGPL 3, see LICENSE for more details.
 */



const RegExp_User_Aggs_Key = /^user_aggs__terms__field:(?<field>.*)__size:\d+$/;

/**
 * This class represents an archive.org item search. You can use
 * this class to search for Archive.org items using the advanced search
 * engine.
 * 
 * @example
 * 
 * import {IaSearch} from "internetarchive-ts";
 * const s = getSession();
 * const search = new IaSearch(s, '(uploader:jake@archive.org)')
 * for result in search:
 *     ...     print(result['identifier'])
*/
export class IaAdvancedSearch extends IaBaseSearch<IaAdvancedSearchParams, TODO> {
    protected readonly session: IaSession;
    protected readonly scrapeUrl: string;
    protected readonly searchUrl: string;
    protected readonly params: IaAdvancedSearchParams;
    protected readonly fields: string[];
    protected readonly sorts: IaSortOption[];

    public constructor(
        session: IaSession,
        query: string,
        {
            fields = [],
            sorts = [],
            params = {},
            maxRetries = 5
        }: IaAdvancedSearchConstructorParams = {}) {
        super(session, query);

        this.fields = fields.length === 0 ? ['identifier'] : fields;
        this.sorts = sorts.length === 0 ? ['addeddate desc'] : sorts;
        this.session = session;
        this.scrapeUrl = `${this.session.url}/services/search/v1/scrape`;
        this.searchUrl = `${this.session.url}/advancedsearch.php`;

        // Initialize params.
        this.params = { 
            q: this.query, 
            output: 'json',
            rows: 100,
            ...params 
        };
        // Always return identifier.
        if (!this.fields.includes('identifier')) {
            this.fields.push('identifier');
        }
        // Add fields
        for (const entry of Object.entries(this.fields)) {
            const [fieldIdx, fieldName] = entry;
            this.params[`fl[${fieldIdx}]`] = fieldName;
        }
        // Add sorts
        for (const entry of Object.entries(this.sorts)) {
            const [sortIdx, fieldName] = entry;
            this.params[`sort[${sortIdx}]`] = fieldName;
        }
    }


    public async getResults(page?: number): Promise<IaAdvancedSearchResult> {
        const response = await this.session.get(this.searchUrl, {
            params: {
                ...this.params,
                page
            }
        });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        const json = await response.json() as IaAdvancedSearchResult | IaApiJsonErrorResult;
        if (isApiJsonErrorResult(json)) {
            throw new IaApiError(json.error, { response });
        }
        this.numFound = json.response.numFound;
        return json;
    }

    // TODO Type
    /**
     * 
     * @returns 
     * @throws {IaApiError}
     * @throws {IaApiRangeError}
     */
    public async *getResultsGenerator(): AsyncGenerator<TODO> {

        /** Counter for results */
        let resultsYielded = 0;
        const resultsPage = await this.getResults(1);
        for (const doc of resultsPage.response.docs) {
            yield doc;
            resultsYielded++;
        }
    }

    // TODO is this still experimental?
    /**
     * Return aggregations for the specified fields
     * For each supplied field, up to 25 buckets will be returned.
     * This does not work on all fields
     * @param aggFields fields to return aggregations for
     * @returns Record where the keys are the requested fields and 
     *          the values are object containing the corresponging aggregations
     * @throws {IaApiError}
     */
    public async aggregations<const T extends IaUserAggField[]>(aggFields: T): Promise<IaUserAggs<T>> {
        if (!aggFields || aggFields.length === 0) throw new IaTypeError(`Aggregation fields must be a non-empty string array`);

        // For getting user aggs, we can omit params like fields, sorts, etc.
        // as these only influence the returned docs.
        // We set rows to 0 so no docs will be returned, only aggregations
        const params: IaUserAggsSearchParams = {
            ...this.params,
            page: 1,
            rows: 0,
            user_aggs: aggFields.join(',')
        };

        const response = await this.session.get(this.searchUrl, { params });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        const json = await response.json() as IaAdvancedSearchResult<T> | TODO;
        console.log(JSON.stringify(json));
        //console.log(json.response.docs);
        //console.log(json.response?.aggregations['user_aggs__terms__field:addeddate__size:25'].buckets);
        if (json.error) {
            throw new IaApiError(json.error, { response, responseBody: json });
        }
        return json as any;
    }

    /**
     * Fetches the number of results for the query of this instance.
     * @returns Number of results for query
     */
    protected async fetchNumFound(): Promise<number> {
        const params = { ...this.params };
        params.total_only = true;
        const response = await this.session.post(this.scrapeUrl, { params });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        const json = await response.json() as TODO;
        if (json.error) {
            throw new IaApiError(json.error);
        }
        return json.total;
    }

    public iterAsResults(): AsyncGenerator {
        return this.getResultsGenerator();
    }

    public async *iterAsItems(): AsyncGenerator<IaItem> {
        const generator = this.getResultsGenerator();
        for await (const result of generator) {
            yield this.session.getItem(result.identifier);
        }
    }

    public async length() {
        return this.getNumFound();
    }
}

export type IaUserAggField = "addeddate" | "subject";

export type IaUserAggs<T extends IaUserAggField[]> = {
    [key in T[number]]: IaUserAggsItem[];
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

const a: IaDefaultAdvancedSearchResultItem = {
    "backup_location": "ia903605_12",
    "collection": [
        "opensource_media",
        "community"
    ],
    "creator": "computer",
    "description": "computer",
    "downloads": 772,
    "format": [
        "Archive BitTorrent",
        "Metadata",
        "Shockwave Flash"
    ],
    "identifier": "computer_915",
    "indexflag": [
        "index",
        "nonoindex",
        "uncurated"
    ],
    "item_size": 428331,
    "mediatype": "movies",
    "month": 1,
    "oai_updatedate": [
        "2010-05-02T00:51:57Z",
        "2010-05-02T00:52:09Z",
        "2021-02-14T04:36:13Z"
    ],
    "publicdate": "2010-05-02T00:52:09Z",
    "subject": "computer",
    "title": "computer",
    "week": 0
};

export type IsoStringDateTime = `${number}-${number}-${number}T${number}:${number}:${number}Z`;


export type IaAdvancedSearchResult<U extends readonly string[] | undefined = undefined> = {
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
        docs: TODO[];
    } & (U extends readonly string[] ? {
        aggregations: {
            [key in `user_aggs__terms__field:${U extends readonly string[] ? U[number] : never}__size:${number}`]: IaUserAggsItem
        };
    } : {});
};
