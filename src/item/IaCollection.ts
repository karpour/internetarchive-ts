import { IaValueError } from "../error";
import { IaSession } from "../session/IaSession";
import { IaItemData, IaItemMetadata } from "../types";
import { arrayFromAsyncGenerator } from "../util/arrayFromAsyncGenerator";
import { IaItem } from "./IaItem";

/** This class represents an archive.org collection. */
export class IaCollection<ItemMetaType extends IaItemMetadata = IaItemMetadata> extends IaItem<ItemMetaType> {
    protected searches: any;

    /**
     * RSS feed URL for this collection
     * @see {@link https://archive.org/help/rss.php}
     */
    public readonly rssUrl;
    itemsCount?: number;
    subCollectionsCount?: number;

    public constructor(archiveSession: IaSession, itemData: IaItemData<ItemMetaType>) {
        super(archiveSession, itemData);
        this.searches = {};
        this.rssUrl = `${this.session.url}/services/collection-rss.php?collection=${this.identifier}`;

        if ((this.metadata.mediatype ??= 'collection') !== 'collection') {
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
        const searchResult = await this.session.searchItems(query, { fields: ['identifier'] });
        this.searches[name] = searchResult;
        if (name === "contents") {
            this.itemsCount = searchResult.numFound;
        } else if (name === 'subcollections') {
            this.subCollectionsCount = searchResult.numFound
        }
        return arrayFromAsyncGenerator(searchResult.getResultsGenerator());
    }
}

export default IaCollection;