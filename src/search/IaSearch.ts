import { IaItem } from "../item/IaItem";
import log from "../log";
import IaSession from "../session/IaSession";
import { IaSearchResultMetaItem, IaSortOption } from "../types";
import { IaScrapeSearchParams, IaScrapeSearchConstructorParams, IaScrapeSearchResult, SearchFields } from "../types/IaSearch";
import { IaBaseSearch, IA_MAX_SEARCH_RESULT_COUNT, IA_MIN_SEARCH_RESULT_COUNT } from "./IaBaseSearch";

/**
 * This class represents an archive.org item search 
 * using the `scrape` API endpoint. For more advanced queries, 
 * use the IaAdvancedSearch class.
 * 
 * @example
 * import { IaSearch } from "internetarchive-ts";
 * const search = new IaSearch(session,"computer chronicles",
 *     {
 *         fields: ['collection', 'mediatype', 'date'],
 *         sorts: ["year desc"],
 *         limit: 30
 *     });
 * console.log(`Total Results: ${await search.getNumFound()}`);
 * for await (const result of search.getResultsGenerator()) {
 *     console.log(result);
 * }
 */
export class IaSearch<const Fields extends string[] | undefined> extends IaBaseSearch<IaSearchResultMetaItem<SearchFields<Fields>>> {
    protected readonly url: string;
    protected readonly basicParams: IaScrapeSearchParams;
    protected readonly params: IaScrapeSearchParams;
    protected readonly fields: string[];
    protected readonly sorts?: IaSortOption[];
    protected readonly limit?: number;

    /**
     * Create a new Ia Search using the basic scrape API
     * @param session Session to use for requests
     * @param query 
     * @param param2 
     * @param param2.fields 
     * @param param2.sorts Sorts
     * @param param2.limit 
     * @param param2.count 
     * @param param2.scope 
     * @param param2.maxRetries 
     */
    public constructor(
        session: IaSession,
        query: string,
        {
            fields,
            sorts,
            limit,
            count,
            scope,
            maxRetries = 5
        }: IaScrapeSearchConstructorParams<Fields> = {}) {
        super(session, query);

        this.fields = fields ?? [];

        // fields must include identifier
        if (!this.fields.includes('identifier')) {
            this.fields.push('identifier');
        }

        if (sorts) {
            this.sorts = sorts.length === 0 ? undefined : sorts;
        }
        
        this.url = `${this.session.url}/services/search/v1/scrape`;
        this.limit = limit;

        // Initialize params.
        this.basicParams = {
            q: this.query,
            output: 'json',
            count,
            scope
        };

        if (this.limit) {
            this.basicParams.count = Math.max(Math.min(this.limit, this.basicParams.count ?? IA_MAX_SEARCH_RESULT_COUNT), IA_MIN_SEARCH_RESULT_COUNT);
        }

        this.params = {
            ...this.basicParams,
            fields: this.fields.join(','),
            sorts: this.sorts ? this.sorts.join(',') : undefined
        };
    }

    public async getResults(cursor?: string): Promise<IaScrapeSearchResult<SearchFields<Fields>>> {
        return this.session.getJson<IaScrapeSearchResult<SearchFields<Fields>>>(this.url, { params: { ...this.params, cursor } });
    }

    public async *getResultsGenerator(): AsyncGenerator<IaSearchResultMetaItem<SearchFields<Fields>>> {
        let resultsYielded = 0;
        let cursor: string | undefined;
        let limit: number;
        do {
            const response = await this.getResults(cursor);
            this.numFound = response.total;

            cursor = response.cursor;
            limit = this.limit ? Math.min(this.numFound, this.limit) : this.numFound;

            for (const item of response.items) {
                resultsYielded++;
                yield item;
                if (resultsYielded >= limit) break;
            }
        } while (cursor !== undefined && resultsYielded < limit);
        if (resultsYielded !== limit) {
            log.warning(`Found ${this.numFound} results, but yielded only ${resultsYielded}`);
        }
    }


    protected async fetchNumFound(): Promise<number> {
        const params: IaScrapeSearchParams = {
            ...this.basicParams,
            total_only: true
        };
        const response = await this.session.getJson<IaScrapeSearchResult<any>>(this.url, { params });
        return response.total;
    }

    public iterAsResults() {
        return this.getResultsGenerator();
    }

    public async *getItemsGenerator(): AsyncGenerator<IaItem> {
        const generator = this.getResultsGenerator();
        for await (const result of generator) {
            yield this.session.getItem(result.identifier);
        }
    }
}