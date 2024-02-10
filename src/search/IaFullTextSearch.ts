import IaSession from "../session/IaSession";
import { handleIaApiError } from "../util/handleIaApiError";
import { IA_MAX_SEARCH_RESULT_COUNT, IaBaseSearch } from "./IaBaseSearch";
import { IaItem } from "../item/IaItem";
import { IaFullTextSearchConstructorParams, IaFullTextSearchParams, IaFullTextSearchResult, IaFullTextSearchResultHitItem } from "../types/IaSearch";
import log from "../logging/log";
import { stripSingle } from "../util/stripSingle";
import { IaApiError, IaValueError } from "../error";

const IA_FTS_API_TARGET = 'v3.11.1';

export class IaFullTextSearch extends IaBaseSearch {

    protected readonly url: string;
    protected readonly params: IaFullTextSearchParams;
    protected readonly limit?: number;
    protected readonly size: number;

    public constructor(
        session: IaSession,
        query: string,
        {
            dslFts = false,
            maxRetries = 5,
            limit,
            scope,
            size
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
        // Initialize params.
        this.params = { q: this.query, size, scope};
        this.params.size = 10;
        if (limit && this.params.size > limit) {
            this.params.size = limit;
        }
        this.size = this.params.size;
        log.verbose(`Created ${this.toString()}`);
    }

    /**
     * 
     * @returns 
     * @throws {IaApiError}
     * @throws {IaApiRangeError}
     */
    public async *getResultsGenerator(): AsyncGenerator<IaFullTextSearchResultHitItem> {
        let from = 0;
        let resultsYielded = 0;
        let limit = this.limit;
        do {
            log.verbose(`Fetching results ${from}-${from + this.size} of ${limit}`);
            const response = await this.session.get(this.url, {
                params: {
                    ...this.params,
                    from
                }
            });
            const json = await response.json() as IaFullTextSearchResult;
            if (!response.ok) {
                throw await handleIaApiError({ response });
            }
            // Check if API verison is the same that this client targets
            if (json['fts-api'].version !== IA_FTS_API_TARGET) {
                log.warning(`API Version mismatch: FTS API client targets "${IA_FTS_API_TARGET}", server returned "${json['fts-api'].version}"`);
            }
            const hits: IaFullTextSearchResultHitItem[] = json.hits.hits;
            if (!hits) {
                break;
            }
            this.numFound = json.hits.total;
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
     *          "top-collection", "top-mediatype", "top-year", "top-subject", 
     *          "top-languages" and "top-creator".
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
        const json = await response.json() as IaFullTextSearchResult;
        return json.aggregations;
    }

    /**
     * @returns Generator which yields Items that match the fulltext query
     * @throws {IaApiError}
     */
    public async *iterAsItems(): AsyncGenerator<IaItem> {
        const generator = this.getResultsGenerator();
        for await (const result of generator) {
            yield this.session.getItem(stripSingle(result.fields.identifier));
        }
    }
}