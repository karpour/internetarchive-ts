import { IaItem } from "../item/IaItem";
import IaSession from "../session/IaSession";

export const IA_MIN_SEARCH_RESULT_COUNT = 10;
export const IA_MAX_SEARCH_RESULT_COUNT = 10000;

export abstract class IaBaseSearch<SearchParams extends Record<string, any>, SearchResultType> {
    protected numFound: number | undefined;

    public constructor(protected readonly session: IaSession, protected query: string) { }
    public toString() {
        return `${this.constructor.name}(query=${this.query})`;
    }
    public abstract getResultsGenerator(): AsyncGenerator<SearchResultType>;
    public abstract iterAsItems(): AsyncGenerator<IaItem>;
    protected abstract fetchNumFound(): Promise<number>;
    public async getNumFound(): Promise<number> {
        return this.numFound ?? (this.numFound = await this.fetchNumFound());
    }
}
