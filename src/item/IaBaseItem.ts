import { IaItemMetadata } from "../types/IaItemMetadata";
import { IaItemData, IaSimplelistEntry } from "../types/IaItemData";
import { IaFileExtendedMetadata, IaFilesXmlMetadata } from "../types/IaFileMetadata";
import { IaItemReview } from "../types";

type Mapping = any;

function identifierListAsItems(...args: any[]) { }
function hash(...args: any[]) { return 1; }


const EXCLUDED_ITEM_METADATA_KEYS = ['workable_servers', 'server'] as const;

export class IaBaseItem<ItemMetaType extends IaItemMetadata = IaItemMetadata>
    implements IaItemData<ItemMetaType> {

    protected exists: boolean;


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
    public get files(): (IaFileExtendedMetadata | IaFilesXmlMetadata)[] {
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
    public get metadata(): ItemMetaType {
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


    public constructor(identifier: string, protected itemData: IaItemData<ItemMetaType>) {
        this.load();
    }

    public get identifier(): string {
        return this.metadata.identifier ?? '';
    }

    public toString(): string {
        let notLoaded = this.exists ? '' : ', item_metadata={}';
        return `${this.constructor.name}(identifier=${this.identifier}${notLoaded})`;
    }


    public load(itemMetadata?: Mapping): void {
        if (itemMetadata) {
            this.itemMetadata = itemMetadata;
        }

        this.exists = this.itemMetadata !== undefined;

        for (let key in this.itemMetadata) {
            (this as any)[key] = this.itemMetadata[key];
        }


        if (!this.identifier) {
            this.identifier ??= this.metadata.identifier;
        }

        let mc = this.metadata.collection ?? [];
        this.collection = identifierListAsItems(mc, this.session);
    }


    public equals(other: IaBaseItem): boolean {
        return (this.itemMetadata == other.itemMetadata || (
            this.itemMetadata.keys() == other.itemMetadata.keys() && true
        ));
        // TODO
        //        or(this.item_metadata.keys() == other.item_metadata.keys()
        //            and all(this.item_metadata[x] == other.item_metadata[x]
        //                    for x in this.item_metadata
        //                    if x not in this.EXCLUDED_ITEM_METADATA_KEYS)))

    }


    public lessOrEqual(other: IaBaseItem): boolean {
        //return this.identifier <= other.identifier
        // TODO string sorting
        return false;
    }

    public hash(): number {
        const withoutExcludedKeys: Partial<IaItemMetadata> = {};
        const items = this.itemMetadata.items();
        for (let key in items) {
            if (!EXCLUDED_ITEM_METADATA_KEYS.includes(key)) {
                withoutExcludedKeys[key] = items[key];
            }
        }
        return hash(JSON.stringify(without_excluded_keys)); // type: ignore
        // return hash(json.dumps(without_excluded_keys, sort_keys=True, check_circular=False))  # type: ignore
    }
}