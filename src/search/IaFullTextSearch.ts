import IaSession from "../session/IaSession.js";
import { handleIaApiError } from "../util/handleIaApiError.js";
import { IA_MAX_SEARCH_RESULT_COUNT, IaBaseSearch } from "./IaBaseSearch.js";
import { IaItem } from "../item/IaItem.js";
import { IaFullTextSearchConstructorParams, IaFullTextSearchParams, IaFullTextSearchResult, IaFullTextSearchResultHitItem } from "../types/IaSearch.js";
import log from "../log/index.js";
import { stripSingle } from "../util/stripSingle.js";
import { IaValueError } from "../error/index.js";

/**
 * Version of the FTS API that this class is targeting
 */
const IA_FTS_API_TARGET = 'v3.11.1';

/**
 * This class creates a full text search using the Internet Archive FTS API endpoint.
 * It offers methods for fetching a single page of results, 
 * creating an AsyncGenerator that continuously yields results, 
 * and a method that returns pre-defined aggregations.
 */
export class IaFullTextSearch extends IaBaseSearch<IaFullTextSearchResultHitItem> {
    protected readonly url: string;
    protected readonly params: IaFullTextSearchParams;
    protected readonly limit?: number;
    protected readonly size: number;

    /**
     * Create a new Fulltext search
     * @param session Session to use for requests.
     * @param query Search query
     * @param param2 Search params
     * @param param2.dslFts If false or undefined, use Lucene DSL, otherwise ElasticSearch DSL TODO ??
     * @param param2.maxRetries Maximum number of retries for each API call (default: `5`)
     * @param param2.limit Maximum amount of results to return. By default all results will be returned
     * @param param2.scope Scope `"standard"` or `"all"` (default: `"standard"`)
     * @param param2.size Number of results to return per API call (default: `10`)
     * @throws {IaValueError}
     */
    public constructor(
        session: IaSession,
        query: string,
        {
            dslFts = false,
            maxRetries = 5,
            limit,
            scope,
            size = 10
        }: IaFullTextSearchConstructorParams = {}) {

        // If dsl is not enabled, add "!L " to the beginning of the query to indicate that the query is a lucene query
        super(session, dslFts ? query : `!L ${query}`);
        if (size && size > IA_MAX_SEARCH_RESULT_COUNT) {
            throw new IaValueError(`Parameter "size" for an FTS request must be equal or below ${IA_MAX_SEARCH_RESULT_COUNT}`);
        }
        if (limit === 0) {
            throw new IaValueError(`Parameter "limit" for an FTS request must be above 0 or undefined`);
        }
        this.limit = limit;
        this.url = `${this.session.protocol}//be-api.us.archive.org/ia-pub-fts-api`;
        // Initialize params
        this.params = { q: this.query, size, scope };
        this.params.size = size;
        if (limit !== undefined && this.params.size > limit) {
            this.params.size = limit;
        }
        this.size = this.params.size;
    }

    /**
     * Create a generator that yields search results.
     * The maximum amount of results returned can be defined by `limit`.
     * If `limit` is not set, all results will be returned, which may
     * require a lot of slow requests to be made to fetch all results.
     * @returns AsyncGenerator which yields one Full Text Search result at a time. 
     * @throws {IaApiError}
     * @throws {IaApiRangeError}
     */
    public async *getResultsGenerator(): AsyncGenerator<IaFullTextSearchResultHitItem> {
        let from = 0;
        let resultsYielded = 0;
        let limit = this.limit;
        do {
            log.verbose(`Fetching results ${from}-${from + this.size} of ${limit}`);
            const response = await this.session.getJson<IaFullTextSearchResult>(this.url, {
                params: {
                    ...this.params,
                    from
                }
            });
            // Check if API verison is the same that this client targets
            if (response['fts-api'].version !== IA_FTS_API_TARGET) {
                log.warning(`API Version mismatch: FTS API client targets "${IA_FTS_API_TARGET}", server returned "${response['fts-api'].version}"`);
            }
            const hits: IaFullTextSearchResultHitItem[] = response.hits.hits;
            if (!hits) {
                break;
            }
            this.numFound = response.hits.total;
            limit = this.limit ? Math.min(this.numFound, this.limit) : this.numFound;
            for (const hit of hits) {
                yield hit;
                resultsYielded++;
                if (resultsYielded >= limit) break;
            }
            from += this.size;
        } while (resultsYielded < limit);
        if (resultsYielded < this.numFound!) {
            log.warning(`Found ${this.numFound} results, but yielded only ${resultsYielded}`);
        }
    }

    /**
     * Fetches number of results for the search
     * @returns Number of results found
     * @throws {IaApiError}
     */
    protected async fetchNumFound(): Promise<number> {
        const params: IaFullTextSearchParams = {
            ...this.params,
            size: 0,
        };
        const response = await this.session.get(this.url, { params });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        const json = await response.json() as IaFullTextSearchResult;
        return json.hits.total;
    }

    /**
     * Get aggregations for the query.
     * @returns object with aggregations for
     *          `"top-collection"`, `"top-mediatype"`, `"top-year"`, 
     *          `"top-subject"`, `"top-languages"` and `"top-creator"`.
     * @throws {IaApiError}
     */
    public async getAggregations(): Promise<IaFullTextSearchResult['aggregations']> {
        const params: IaFullTextSearchParams = {
            ...this.params,
            size: 0,
        };
        const response = await this.session.get(this.url, { params });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        const result = await response.json() as IaFullTextSearchResult;
        return result.aggregations;
    }

    /**
     * @returns Generator which yields Items that match the full text query
     * @throws {IaApiError}
     */
    public async *getItemsGenerator(): AsyncGenerator<IaItem> {
        const generator = this.getResultsGenerator();
        for await (const result of generator) {
            yield this.session.getItem(stripSingle(result.fields.identifier));
        }
    }
}