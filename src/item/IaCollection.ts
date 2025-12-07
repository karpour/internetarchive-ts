import { IaValueError } from "../error/index.js";
import { IaSession } from "../session/IaSession.js";
import { IaBaseMetadataType, IaItemData } from "../types/index.js";
import { IaItem } from "./IaItem.js";

/** This class represents an archive.org collection. */
export class IaCollection<
    ItemMetaType extends IaBaseMetadataType = IaBaseMetadataType,
    ItemFileMetaType extends IaBaseMetadataType = IaBaseMetadataType
> extends IaItem<ItemMetaType, ItemFileMetaType> {
    protected searches: any;

    /**
     * RSS feed URL for this collection
     * @see {@link https://archive.org/help/rss.php}
     */
    public readonly rssUrl;
    itemsCount?: number;
    subCollectionsCount?: number;

    public constructor(archiveSession: IaSession, itemData: IaItemData<ItemMetaType, ItemFileMetaType>) {
        super(archiveSession, itemData);
        this.searches = {};
        this.rssUrl = `${this.session.url}/services/collection-rss.php?collection=${this.identifier}`;

        if (this.metadata.mediatype !== 'collection') {
            throw new IaValueError('mediatype is not "collection"!');
        }
    }

    public async getContents() {
        return this.doSearch('contents', this.metadata.search_collection ?? `collection:${this.identifier}`);
    }

    public async getSubcollections() {
        return this.doSearch('subcollections', `collection:${this.identifier} AND mediatype:collection`);
    }

    protected async doSearch(name: string, query: string) {
        const searchResult = await this.session.searchAdvanced(query, { fields: ['identifier'] });
        this.searches[name] = searchResult;
        const results = await Array.fromAsync(searchResult.getResultsGenerator());
        if (name === "contents") {
            this.itemsCount = results.length;
        } else if (name === 'subcollections') {
            this.subCollectionsCount = results.length;
        }
        return results;
    }
}

export default IaCollection;