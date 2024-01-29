import { IaValueError } from "../error";
import { IaSession } from "../session/IaSession";
import { IaItemData, IaItemMetadata } from "../types";
import { arrayFromAsyncGenerator } from "../util/arrayFromAsyncGenerator";
import { IaItem } from "./IaItem";

export type IaNameCountType = `${string}_count`;

/** This class represents an archive.org collection. */
export class IaCollection<ItemMetaType extends IaItemMetadata = IaItemMetadata> extends IaItem<ItemMetaType> {
    protected searches: any;
    [key: IaNameCountType]: number;

    public constructor(archiveSession: IaSession,itemData: IaItemData<ItemMetaType>) {
            super(archiveSession, itemData);
        this.searches = {};

        if ((this.metadata.mediatype ??= 'collection') !== 'collection') {
            throw new IaValueError('mediatype is not "collection"!');
        }
    }

    public async getContents() {
        const defaultSearch = `collection:${this.identifier}`;
        return this.doSearch('contents', this.metadata.search_collection ?? defaultSearch);
    }

    public async getSubcollections() {
        const defaultSearch = `collection:${this.identifier}`;
        return this.doSearch('subcollections', `${defaultSearch} AND mediatype:collection`);
    }

    protected async doSearch(name: string, query: string) {
        const rtn = await this.session.searchItems(query, { fields: ['identifier'] });
        this.searches[name] = rtn;
        if (!this[`${name}_count`]) {
            this[`${name}_count`] = this.searches[name].numFound;
        }
        return arrayFromAsyncGenerator(rtn.getResultsGenerator());
    }
}

export default IaCollection;