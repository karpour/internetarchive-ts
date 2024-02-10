import { IaItem } from "../item/IaItem";
import IaSession from "../session/IaSession";

export const IA_MIN_SEARCH_RESULT_COUNT = 100;
export const IA_MAX_SEARCH_RESULT_COUNT = 10000;

export abstract class IaBaseSearch {
    protected numFound: number | undefined;

    public constructor(protected readonly session: IaSession, protected query: string) { }
    public toString() {
        return `${this.constructor.name}(query=${this.query})`;
    }
    public abstract getResultsGenerator(): AsyncGenerator;
    public abstract iterAsItems(): AsyncGenerator<IaItem>;
    protected abstract fetchNumFound(): Promise<number>;

    /**
     * Get the number if items found by this query.
     * 
     * Note that this number can change over time. 
     * The number also gets updated with every call to the search API.
     * 
     * @returns Number of items found
     */
    public async getNumFound(): Promise<number> {
        return this.numFound ?? (this.numFound = await this.fetchNumFound());
    }
    public async length() {
        return this.getNumFound();
    }
}
