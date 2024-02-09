import { IaValueError } from "../error";
import { IaSession } from "../session/IaSession";
import { IaBaseMetadataType, IaItemData, IaItemExtendedMetadata } from "../types";
import { arrayFromAsyncGenerator } from "../util/arrayFromAsyncGenerator";
import { IaItem } from "./IaItem";

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
        // TODO can search_collection be string[]?
        return this.doSearch('contents', this.metadata.search_collection as string ?? `collection:${this.identifier}`);
    }

    public async getSubcollections() {
        return this.doSearch('subcollections', `collection:${this.identifier} AND mediatype:collection`);
    }

    protected async doSearch(name: string, query: string) {
        const searchResult = await this.session.searchAdvanced(query, { fields: ['identifier'] });
        this.searches[name] = searchResult;
        const results = await arrayFromAsyncGenerator(searchResult.getResultsGenerator());
        if (name === "contents") {
            this.itemsCount = results.length;
        } else if (name === 'subcollections') {
            this.subCollectionsCount = results.length;
        }
        return results;
    }
}

export default IaCollection;