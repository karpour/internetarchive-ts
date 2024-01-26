import { IaValueError } from "../error";
import { IaSession } from "../session/IaSession";
import { IaItemData, IaItemMetadata, IaItemTabUrlType, IaItemUrlType } from "../types";
import { arrayFromAsyncGenerator } from "../util/arrayFromAsyncGenerator";
import { IaItem } from "./IaItem";

export type IaNameCountType = `${string}_count`;

/** This class represents an archive.org collection. */
export class IaCollection<ItemMetaType extends IaItemMetadata = IaItemMetadata> extends IaItem<ItemMetaType> {
    protected searches: any;
    [key: IaNameCountType]: number;

    /** Item URL types. For a collection, this includes Tab url types */
    declare public urls: {
        [urlKey in IaItemUrlType | IaItemTabUrlType]: string;
    };


    public constructor(archiveSession: IaSession,itemData: IaItemData<ItemMetaType>) {
            super(archiveSession, itemData);
        this.searches = {};

        if ((this.metadata.mediatype ??= 'collection') !== 'collection') {
            throw new IaValueError('mediatype is not "collection"!');
        }
    }

    public async getContents() {
        const defltSrh = `collection:${this.identifier}`;
        return this.doSearch('contents', this.metadata.search_collection ?? defltSrh);
    }

    public async getSubcollections() {
        const defltSrh = `collection:${this.identifier}`;
        return this.doSearch('subcollections', `${defltSrh} AND mediatype:collection`);
    }

    protected async doSearch(name: string, query: string) {
        const rtn = await this.session.searchItems(query, { fields: ['identifier'] });
        this.searches[name] = rtn;
        if (!this[`${name}_count`]) {
            this[`${name}_count`] = this.searches[name].numFound;
        }
        return arrayFromAsyncGenerator(rtn);
    }
}

export default IaCollection;