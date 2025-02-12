import { IaItemData, ItemDataKey } from "../types/IaItemData";
import { IaSimplelistEntry } from "../types/IaSimplelistEntry";
import { IaBaseMetadataType, IaItemReview } from "../types";
import { createHash } from "crypto";

/** Metadata keys to exclude when making hash calculation */
const EXCLUDED_ITEM_METADATA_KEYS: ItemDataKey[] = ['workable_servers', 'server'];

/**
 * The base class for an Internet Archive Item, providing common methods of {@link IaItem} and {@link IaCollection}
 */
export abstract class IaBaseItem<
    ItemMetaType extends IaBaseMetadataType = IaBaseMetadataType,
    ItemFileMetaType extends IaBaseMetadataType = IaBaseMetadataType
> implements IaItemData<ItemMetaType, ItemFileMetaType> {

    protected exists: boolean = false;
    //protected readonly _collection:IaCollection[] = []

    public get created(): number {
        return this.itemData.created;
    }
    public get d1(): string | undefined {
        return this.itemData.d1;
    }
    public get d2(): string | undefined {
        return this.itemData.d2;
    }
    public get dir(): string {
        return this.itemData.dir;
    }
    public get files(): IaItemData<ItemMetaType, ItemFileMetaType>['files'] {
        return this.itemData.files;
    }
    public get files_count(): number {
        return this.itemData.files_count;
    }
    public get item_last_updated(): number {
        return this.itemData.item_last_updated;
    }
    public get item_size(): number {
        return this.itemData.item_size;
    }
    public get metadata(): IaItemData<ItemMetaType, ItemFileMetaType>['metadata'] {
        return this.itemData.metadata;
    }
    public get server(): string {
        return this.itemData.server;
    }
    public get uniq(): number {
        return this.itemData.uniq;
    }
    public get workable_servers(): string[] {
        return this.itemData.workable_servers;
    }
    public get simplelists(): { [key: string]: IaSimplelistEntry; } | undefined {
        return this.itemData.simplelists;
    }
    public get solo(): boolean {
        return this.itemData.solo ?? false;
    }
    public get servers_unavailable(): boolean {
        return this.itemData.servers_unavailable ?? false;
    }
    public get pending_tasks(): boolean {
        return this.itemData.pending_tasks ?? false;
    }
    public get has_redrow(): boolean {
        return this.itemData.has_redrow ?? false;
    }
    public get is_dark(): boolean {
        return this.itemData.is_dark ?? false;
    }
    public get nodownload(): boolean {
        return this.itemData.nodownload ?? false;
    }
    public get is_collection(): boolean {
        return this.itemData.is_collection ?? false;
    }
    public get reviews(): IaItemReview[] {
        return this.itemData.reviews ?? [];
    }

    public constructor(public itemData: IaItemData<ItemMetaType, ItemFileMetaType>) {
        this.load();
    }

    public get identifier(): IaItemData<ItemMetaType, ItemFileMetaType>['metadata']['identifier'] {
        return this.metadata.identifier;
    }

    public toString(): string {
        let notLoaded = this.exists ? '' : ', item_metadata={}';
        return `${this.constructor.name}(identifier=${this.identifier}${notLoaded})`;
    }


    public load(itemData?: IaItemData<ItemMetaType, ItemFileMetaType>): void {
        if (itemData) this.itemData = itemData;
        let mc = this.metadata.collection ?? [];
        //this.collection = identifierListAsItems(mc, this.session);
    }

    // TODO this might fail due to fields not being sorted the same way
    public equals(other: IaBaseItem): boolean {
        return this.hash() == other.hash();
    }

    /**
     * Get thumbnail URL for this item
     * @returns URL
     */
    public getImgUrl(): string {
        return `https://archive.org/services/img/${this.identifier}`;
    }

    /**
     * Compare this item with another item, for sorting. Compares the 2 identifiers using {@link String.localeCompare}
     * @param other Item to compare this item with
     * @returns Return type of {@link String.localeCompare} which might differ based on the runtime
     */
    public lessOrEqual(other: IaBaseItem): ReturnType<String['localeCompare']> {
        return this.identifier.localeCompare(other.identifier);
    }

    /**
     * Create hash of this item based on the stringified metadata object, excluding keys defined in {@link EXCLUDED_ITEM_METADATA_KEYS}
     * @returns MD5 hash as string
     */
    public hash(): string {
        const items: Partial<IaItemData<ItemMetaType, ItemFileMetaType>> = { ...this.itemData };
        for (const key of EXCLUDED_ITEM_METADATA_KEYS) {
            delete items[key];
        }
        const hash = createHash('md5');
        hash.update(JSON.stringify(items));
        return hash.digest('hex');
    }
}