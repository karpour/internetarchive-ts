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

import { IaApiError } from "../error";
import { IaItem } from "../item/IaItem";
import IaSession from "../session/IaSession";
import { IaSearchParams, IaSessionSearchItemsParams } from "../types/IaParams";
import { handleIaApiError } from "../util/handleIaApiError";


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

/**
 * This class represents an archive.org item search. You can use
 * this class to search for Archive.org items using the advanced search
 * engine.
 * 
 * @example
 * 
 * import {ArchiveSession, IaSearch} from "internetarchive-ts";
 * const s = new ArchiveSession();
 * const search = new Search(s, '(uploader:jake@archive.org)')
 * for result in search:
 *     ...     print(result['identifier'])
*/
export class IaSearch {
    protected session: IaSession;
    protected fts: boolean;
    protected ftsUrl: string;
    protected scrapeUrl: string;
    protected searchUrl: string;
    protected query: string;
    protected dslFts: boolean;
    protected params: IaSearchParams;
    protected fields: string[];
    protected sorts: string[];

    private numFound!: number;

    public constructor(
        archiveSession: IaSession,
        query: string,
        {
            fields = [],
            sorts = [],
            params = {},
            fullTextSearch = false,
            dslFts = false,
            maxRetries = 5
        }: IaSessionSearchItemsParams) {

        this.fields = fields;
        this.sorts = sorts;
        this.dslFts = dslFts;
        this.session = archiveSession;
        this.fts = (this.dslFts || fullTextSearch);
        this.query = query;
        if (this.fts && !this.dslFts) {
            this.query = `!L ${this.query}`;
        }
        this.ftsUrl = `${this.session.protocol}//be-api.us.archive.org/ia-pub-fts-api`;
        this.scrapeUrl = `${this.session.url}/services/search/v1/scrape`;
        this.searchUrl = `${this.session.url}/advancedsearch.php`;

        // Initialize params.
        const defaultParams: IaSearchParams = { q: this.query };
        if (!params.page) {
            if (params.rows) {
                defaultParams.page = 1;
            } else {
                defaultParams.count = 10000;
            }
        } else {
            defaultParams.output = 'json';
        }

        this.params = { ...defaultParams, ...params };
    }

    public toString() {
        return `Search(query=${this.query})`;
    }

    // TODO Type
    protected async *advancedSearch(): AsyncGenerator<any[]> {
        // Always return identifier.
        if (!this.fields.includes('identifier')) {
            this.fields.push('identifier');
        }

        for (const entry of Object.entries(this.fields)) {
            const [fieldIdx, fieldName] = entry;
            this.params[`fl[${fieldIdx}]`] = fieldName;
        }

        for (const entry of Object.entries(this.sorts)) {
            const [sortIdx, fieldName] = entry;
            this.params[`sort[${sortIdx}]`] = fieldName!;
        }

        this.params.output = 'json';

        const response = await this.session.get(this.searchUrl, {
            params: this.params,
        });
        if(!response.ok) {
            throw await handleIaApiError(response)
        }
        const json = await response.json();

        if (json.error) {
            throw new IaApiError(json.error, {response});
        }
 
        this.numFound = parseInt(json.response?.numFound ?? 0);
        yield json.response?.docs ?? [];
    }

    public async *scrape(): AsyncGenerator<any> {
        if (this.fields) {
            this.params.fields = this.fields.join(',');
        }
        if (this.sorts) {
            this.params.sorts = this.sorts.join(',');
        }
        let i = 0;
        let numFound = undefined;
        while (true) {
            const response = await this.session.post(this.scrapeUrl, { params: this.params });
            const json = await response.json();
            if (json.error) {
                yield json;
            }
            if (numFound === undefined) {
                numFound = parseInt(json.total);
            }
            this.numFound ??= numFound;
            this.handleScrapeError(json);

            this.params.cursor = json.cursor;
            for (const item in json.items) {
                i += 1;
                yield item;
            }

            if (!json.cursor) {
                if (i !== numFound) {
                    throw new Error(`The server failed to return results in the allotted amount of time for ${this.scrapeUrl}`);
                }
                break;
            }
        }
    }



    // TODO return type

    /**
     * 
     * @returns 
     */
    protected async *fullTextSearch(): AsyncGenerator<any> {
        const params: IaSearchParams = {
            q: this.query,
            size: 10000,
            from: 0,
            scroll: true,
        };

        if (this.params.scope) {
            params.scope = this.params.scope;
        }

        if (this.params.size) {
            params.size = this.params.size;
            params.scroll = false;
        }

        while (true) {
            const result = await this.session.post(this.ftsUrl, { json: params });
            const json = await result.json();
            const scrollId = json._scroll_id;
            // TODO json.hits.hits ??
            const hits = json.hits;
            if (!hits) {
                return;
            }
            for (const hit of hits) {
                yield hit;
            }
            if (!params.scroll) {
                break;
            }
            params.scroll_id = scrollId;
        }
    }


    public getResultsGenerator(): AsyncGenerator<any> {
        if (this.fts) {
            return this.fullTextSearch();
        } if (this.params.user_aggs !== undefined) {
            return this.userAggs();
        } else if (this.params.page !== undefined) {
            return this.advancedSearch();
        } else {
            return this.scrape();
        }
    }

    public async *userAggs(): AsyncGenerator<any> {
        //Experimental support for user aggregations.

        this.params.page = 1;
        this.params.rows = 1;
        this.params.output = 'json';
        const response = await this.session.get(this.searchUrl, { params: this.params });
        const json = await response.json();
        if (json.error) {
            yield json;
        }
        for (const agg of json.response?.aggregations ?? {}) {
            yield { [agg[0]]: agg[1] };
        }
    }

    public async getNumFound(): Promise<number> {
        if (!this.numFound) {
            if (!this.fts) {
                const params = { ...this.params };
                params.total_only = true;
                const response = await this.session.post(this.scrapeUrl, { params });
                const json = await response.json();
                await this.handleScrapeError(json);
                this.numFound = json.total;
            } else {
                this.params.q = this.query;
                const r = await this.session.get(this.ftsUrl, {
                    params: this.params
                });
                const json = await r.json();
                this.numFound = json.hits?.total;
            }
        }
        return this.numFound;
    }

    protected handleScrapeError(j: { error?: string; }) {
        if (j.error) {
            throw new Error(j.error);
        }
    }

    public iterAsResults() {
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



/** 
class SearchIterator {
    /**This class is an iterator wrapper for search results.

    It provides access to the underlying Search, and supports
    len() (since that is known initially

    public constructor(protected search: any, protected iterator: any) {
        this.search = search;
        this.iterator = iterator;
    }
    public __len__() {
        return this.search.num_found;
    }
    public __next__() {
        return next(this.iterator);
    }
    public __iter__() {
        return this;
    }
    public toString() {
        return `${this.constructor.name}(${this.search}, ${this.iterator})`;
    }


}
*/