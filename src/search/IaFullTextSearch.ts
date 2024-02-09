import { todo } from "node:test";
import IaSession from "../session/IaSession";
import { TODO } from "../todotype";
import { IaAdvancedSearchConstructorParams, IaAdvancedSearchParams, IaSortOption, IaFullTextSearchConstructorParams, IaBaseMetadataType, IaFullTextSearchParams } from "../types";
import { handleIaApiError } from "../util/handleIaApiError";
import { IA_MAX_SEARCH_RESULT_COUNT, IaBaseSearch } from "./IaBaseSearch";
import { IaItem } from "../item/IaItem";
import { IaFullTextSearchResult, IaFullTextSearchResultHitItem } from "../types/IaSearch";
import log from "../logging/log";
import { stripSingle } from "../util/stripSingle";
import { IaApiError, IaValueError } from "../error";

const IA_FTS_API_TARGET = 'v3.11.1';

export class IaFullTextSearch extends IaBaseSearch<TODO, TODO> {

    protected readonly url: string;
    protected readonly params: IaFullTextSearchParams;

    public constructor(
        session: IaSession,
        query: string,
        {
            params = {},
            dslFts = false,
            maxRetries = 5
        }: IaFullTextSearchConstructorParams = {}) {

        super(session, dslFts ? query : `!L ${query}`);
        if (params.size && params.size > IA_MAX_SEARCH_RESULT_COUNT) {
            throw new IaValueError(`Parameter "size" for an FTS request must be equal or below ${IA_MAX_SEARCH_RESULT_COUNT}`);
        }
        this.url = `${this.session.protocol}//be-api.us.archive.org/ia-pub-fts-api`;
        // Initialize params.
        this.params = { q: this.query, ...params };
    }

    // TODO scroll_id doesn't seem to be supported
    /**
     * 
     * @returns 
     */
    public async *getResultsGenerator(): AsyncGenerator<IaFullTextSearchResultHitItem> {
        const params: IaAdvancedSearchParams = {
            size: 10,
            //size: IA_MAX_SEARCH_RESULT_COUNT,
            from: 0,
            ...this.params
        };


        const limit = Math.max(this.numFound ?? 0);
        let resultsYielded = 0;

        while (true) {
            const response = await this.session.get(this.url, { params });
            const json = await response.json() as IaFullTextSearchResult;
            // Check if API verison is the same that this client targets
            if (json['fts-api'].version !== IA_FTS_API_TARGET) {
                log.warning(`API Version mismatch: FTS API client targets "${IA_FTS_API_TARGET}", server returned "${json['fts-api'].version}"`);
            }
            if (!response.ok) {
                throw await handleIaApiError({ response });
            }
            const scrollId = json._scroll_id;
            const hits: IaFullTextSearchResultHitItem[] = json.hits.hits;
            hits.forEach(h => console.log(h));
            if (!hits) {
                return;
            }
            for (const hit of hits) {
                yield hit;
                resultsYielded++;
            }
            if (!params.scroll) {
                break;
            }
            params.scroll_id = scrollId;
        }
    }

    public async fetchNumFound(): Promise<number> {
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

    public async aggregations(): Promise<IaFullTextSearchResult['aggregations']> {
        throw new Error();
    }

    /**
     * @returns Generator which yields Items that match the fulltext query
     * @throws {IaApiError}
     */
    public async *iterAsItems(): AsyncGenerator<IaItem<IaBaseMetadataType, IaBaseMetadataType>, any, unknown> {
        const generator = this.getResultsGenerator();
        for await (const result of generator) {
            yield this.session.getItem(stripSingle(result.fields.identifier));
        }
    }
}