import { IaApiError } from "../error";
import { IaItem } from "../item/IaItem";
import IaSession from "../session/IaSession";
import { TODO } from "../todotype";
import { IaAdvancedSearchParams, IaSortOption, IaAdvancedSearchConstructorParams, IaApiJsonErrorResult } from "../types";
import { handleIaApiError } from "../util/handleIaApiError";
import { IaAdvancedSearchResult, IaUserAggField, IaUserAggs } from "./IaAdvancedSearch";
import { IaBaseSearch, IA_MAX_SEARCH_RESULT_COUNT } from "./IaBaseSearch";

/**
 * This class represents an archive.org item search 
 * using the scrape API endpoint. For more advanced queries, 
 * use the IaAdvancedSearch class.
 * 
 * @example
 * 
 * import {IaSearch} from "internetarchive-ts";
 * const s = getSession();
 * const search = new IaSearch(s, '(uploader:jake@archive.org)')
 * for result in search:
 *     ...     print(result['identifier'])
*/
export class IaSearch extends IaBaseSearch<IaAdvancedSearchParams, TODO> {
    protected readonly url: string;
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
        this.url = `${this.session.url}/services/search/v1/scrape`;

        // Initialize params.
        this.params = {
            q: this.query,
            output: 'json',
            ...params
        };
    }



    public async *getResultsGenerator(): AsyncGenerator<any> {
        const additionalParams: Record<string, string> = {
            fields: this.fields.join(','),
            sorts: this.sorts.join(',')
        };

        console.log(this.params);
        let i = 0;
        let numFound = undefined;
        while (true) {
            const response = await this.session.post(this.url, { params: { ...this.params, ...additionalParams } });
            const json = await response.json();
            if (json.error) {
                yield json;
            }
            if (numFound === undefined) {
                numFound = parseInt(json.total);
            }
            this.numFound ??= numFound;
            if (json.error) {
                throw new IaApiError(json.error, { response, responseBody: json });
            }

            this.params.cursor = json.cursor;
            for (const item of json.items) {
                i += 1;
                yield item;
            }

            if (!json.cursor) {
                if (i !== numFound) {
                    throw new IaApiError(`The server failed to return results in the allotted amount of time for ${this.url}`, { response, responseBody: json });
                }
                break;
            }
        }
    }

    protected async fetchNumFound(): Promise<number> {
        const params = { ...this.params };
        params.total_only = true;
        const response = await this.session.post(this.url, { params });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        const json = await response.json();
        if (json.error) {
            throw new IaApiError(json.error);
        }
        return json.total;
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