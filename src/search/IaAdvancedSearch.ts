import { IaApiElasticSearchError, IaApiError, IaApiRangeError, IaTypeError } from "../error/index.js";
import { IaItem } from "../item/IaItem.js";
import IaSession from "../session/IaSession.js";
import { TODO } from "../todotype.js";
import { IaApiJsonErrorResult, IaSortOption } from "../types/index.js";
import { handleIaApiError } from "../util/handleIaApiError.js";
import { IaBaseSearch } from "./IaBaseSearch.js";
import { isApiJsonErrorResult } from "../util/isApiJsonErrorResult.js";
import { IaAdvancedSearchConstructorParams, IaAdvancedSearchParams, IaAdvancedSearchResult, IaAggregatableField, IaUserAggs, IaUserAggsSearchParams } from "../types/IaSearch.js";
import log from "../log/index.js";
import { retry } from "../util/retry.js";

const RegExp_User_Aggs_Key = /^user_aggs__terms__field:(?<field>.*)__size:\d+$/;

/**
 * This class represents an archive.org item search using the
 * advancedSearch API endpoint.
 * 
 * @typeParam Fields - Search fields, inferred by the search params. If not supplied, a default set of fields will be returned
 * 
 * @example
 * ```typescript
 * import { IaSearch } from "internetarchive-ts";
 * 
 * const search = new IaAdvancedSearch(session, 'computer chronicles');
 * 
 * console.log(`Results: ${await search.getNumFound()}`)
 * for await (const result of search.getResultsGenerator()) {
 *     console.log(result);
 * }
 * ```
 */
export class IaAdvancedSearch<const Fields extends string[] | undefined> extends IaBaseSearch<IaAdvancedSearchResult> {
    protected readonly session: IaSession;
    protected readonly url: string;
    protected readonly basicParams: IaAdvancedSearchParams;
    protected readonly params: IaAdvancedSearchParams;
    protected readonly fields?: string[];
    protected readonly sorts: IaSortOption[];
    protected readonly limit?: number;
    protected readonly maxRetries: number;

    /**
     * Create a new advanced search
     * @param session Session to use for API requests
     * @param query Search query
     * @param param2 
     * @param param2.fields Fields to include in the results. If not supplied, a standard set of fields will be returned.
     *        Regardless of which fields are supplied, the `"identifier"` field will always be included.
     * @param param2.sorts Up to 3 sort options
     * @param param2.scope Scope `"standard"` or `"all"` (default: `"standard"`)
     * @param param2.rows Number of items to return per API query (default: `100`)
     * @param param2.limit Maximum number of retries for each API call (default: `5`)
     * @param param2.maxRetries
     */
    public constructor(
        session: IaSession,
        query: string,
        {
            fields,
            limit,
            maxRetries = 5,
            rows,
            scope,
            sorts = []
        }: IaAdvancedSearchConstructorParams<Fields> = {}) {
        super(session, query);

        this.sorts = sorts.length === 0 ? ['addeddate desc'] : sorts;
        this.session = session;
        this.url = `${this.session.url}/advancedsearch.php`;
        this.limit = limit;
        this.basicParams = {
            q: this.query,
            output: 'json',
            rows: rows ?? 100,
            scope
        };
        this.maxRetries = maxRetries;
        // Initialize params.
        this.params = {
            ...this.basicParams
        };
        // Always return identifier.
        this.fields = Array.isArray(fields) ? [...fields] : [];
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

    /**
     * Get a single page of results.
     * This method also updates the `numFound` value.
     * @param page Page number
     * @returns Search Result object
     */
    public async getResults(page?: number): Promise<IaAdvancedSearchResult> {
        const response = await retry(() => this.session.get(this.url, {
            params: {
                ...this.params,
                page
            }
        }), this.maxRetries);
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

    /**
     * Create a generator that yields search results.
     * The maximum amount of results returned can be defined by `limit`.
     * If `limit` is not set, all results will be returned, which may
     * require a lot of slow requests to be made to fetch all results.
     * @returns AsyncGenerator which yields one search result at a time. 
     * @throws {IaApiError}
     * @throws {IaApiRangeError}
     */
    public async *getResultsGenerator(): AsyncGenerator<TODO> {
        /** Counter for results */
        let resultsYielded = 0;
        let page = 1;
        let limit: number | undefined = this.limit;

        do {
            log.verbose(`Fetching results ${resultsYielded}-${resultsYielded + this.params.rows!} of ${limit}`);

            const response = await this.getResults(page);
            this.numFound = response.response.numFound;

            limit = this.limit ? Math.min(this.numFound, this.limit) : this.numFound;

            if (response.response.docs.length == 0) {
                break;
            }
            for (const doc of response.response.docs) {
                yield doc;
                resultsYielded++;
                if (resultsYielded >= limit) break;
            }
            page++;
        } while (resultsYielded < limit);
        if (resultsYielded < limit) {
            log.warning(`Found ${this.numFound} results, but yielded only ${resultsYielded}`);
        }
    }

    /**
     * Return aggregations for the specified fields
     * For each supplied field, up to 25 buckets will be returned.
     * 
     * This only works on specific fields. These are defined in {@link IA_AGGREGATABLE_FIELDS}
     * 
     * @param aggFields fields to return aggregations for
     * @param aggsSize number of aggregations to return (Default 25)
     * @returns Record where the keys are the requested fields and 
     *          the values are object containing the corresponding aggregations
     * @template AggFields Array of fields to aggregate
     * @throws {IaApiError}
     * @throws {IaTypeError}
     * @throws {IaApiElasticSearchError}
     */
    public async getAggregations<const AggFields extends IaAggregatableField[]>(aggFields: AggFields, aggsSize?: number): Promise<IaUserAggs<AggFields>> {
        if (!aggFields || aggFields.length === 0) {
            throw new IaTypeError(`Aggregation fields must be a non-empty string array`);
        }
        if (aggsSize && (!Number.isInteger(aggsSize) || aggsSize < 0)) {
            throw new IaTypeError(`aggsSize must be a positive integer`);
        }

        // For getting user aggs, we can omit params like fields, sorts, etc.
        // as these only influence the returned docs.
        // Rows is set to 0 so no docs will be returned
        const params: IaUserAggsSearchParams = {
            ...this.basicParams,
            page: 1,
            rows: 0,
            user_aggs: aggFields.join(','),
            user_aggs_size: aggsSize
        };

        const response = await this.session.getJson<IaAdvancedSearchResult<undefined, AggFields>>(this.url, { params });
        const aggs: IaUserAggs<any> = {};

        for (const entry of Object.entries(response.response.aggregations)) {
            const [key, aggItem] = entry;
            // Query for "year" returns an additional histogram, we ignore that here.
            if (key.endsWith("_histogram")) {
                continue;
            }
            const r = RegExp_User_Aggs_Key.exec(key);
            if (!r) {
                throw new IaTypeError(`Aggregation key "${key}" does not match Regexp /^user_aggs__terms__field:(?<field>.*)__size:\d+$/`);
            }
            const field = r.groups!.field!;
            if (!aggFields.includes(field as IaAggregatableField)) {
                throw new IaTypeError(`Response included field "${field}", which is not included in requested fields "${aggFields.join(',')}"`);
            }
            aggs[r.groups!.field!] = aggItem;
        }
        return aggs as IaUserAggs<AggFields>;
    }

    /**
     * A wrapper for {@link IaAdvancedSearch.getResultsGenerator} which
     * fetches the corresponding {@link IaItem} for each result and yields it
     * @returns Generator which yields Items
     */
    public async *getItemsGenerator(): AsyncGenerator<IaItem> {
        const generator = this.getResultsGenerator();
        for await (const result of generator) {
            yield this.session.getItem(result.identifier);
        }
    }

    /**
     * Fetches the number of results for the query of this instance.
     * @returns Number of results for this search
     */
    protected async fetchNumFound(): Promise<number> {
        const params: IaAdvancedSearchParams = {
            ...this.params,
            rows: 0,
            page: undefined,
        };
        const response = await this.session.getJson<IaAdvancedSearchResult>(this.url, { params });
        return response.response.numFound;
    }
}

export default IaAdvancedSearch;