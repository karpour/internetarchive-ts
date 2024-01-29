import { IaItemReview, IaItemReviewRaw } from "./IaItemReview";
import { IaItemBaseMetadata, IaItemMetadata } from "./IaItemMetadata";
import { IaFilesXmlMetadata, IaFileBaseMetadata } from "./IaFileMetadata";
import { IaSimplelistEntry } from "./IaSimplelistEntry";
import { IaRawMetadata } from "./IaTypes";

export type IaRawItemData = Omit<IaItemData<IaRawMetadata<IaItemBaseMetadata>, IaRawMetadata<IaFileBaseMetadata>>, 'reviews'> & {
    reviews?: IaItemReviewRaw[];
};

export type IaAlternateItemLocationEntry = {
    server: string,
    dir: string;
};

export type IaAlternateItemLocations = {
    servers?: IaAlternateItemLocationEntry[],
    workable?: IaAlternateItemLocationEntry[];
};


export type IaItemData<ItemMetaType extends IaItemBaseMetadata = IaItemMetadata, ItemFileMetaType extends IaFileBaseMetadata | IaRawMetadata<IaFileBaseMetadata> = IaFileBaseMetadata> = {
    /** Date the item was created on */
    created: number; // conv

    /** The primary data node the item is stored on */
    d1?: string;

    /** The secondary (backup) data node the item is stored on (unless stored on a solo node) */
    d2?: string;

    /** The item's absolute pathname (on both data nodes) */
    dir: string;

    alternate_locations?: IaAlternateItemLocations;

    /** File metadata for this item */
    files: (ItemFileMetaType | IaFilesXmlMetadata)[];

    /** Total number of files in the item */
    files_count: number; // conv

    /** The time when the item was last modified */
    item_last_updated: number; // conv

    /** Total size in bytes of all files in the item */
    item_size: number; // conv

    /** Item Metadata */
    metadata: ItemMetaType;

    /** The preferred server for reading the item's contents. Callers should use this node when constructing a URL */
    server: string;

    /**  */
    uniq: number; // conv

    /** A list of data nodes currently available for accessing the item's contents */
    workable_servers: string[];
    // TODO

    /**  */
    simplelists?: {
        /** Simple list name */
        [key: string]: IaSimplelistEntry;
    };

    /** The item is only stored on a single node (rare) */
    solo?: boolean;

    /** One or both servers are unavailable, that is, inaccessible for some reason (network problems, under service, etc.) */
    servers_unavailable?: boolean;

    /** Indicates one or more tasks are queued or running */
    pending_tasks?: boolean;

    /** Indicates one or more tasks are red (halted due to error) */
    has_redrow?: boolean;

    /** The item was darked and is unavailable */
    is_dark?: boolean;

    /** The item is not ready for downloading */
    nodownload?: boolean;

    /** The item is a collection */
    is_collection?: boolean;

    /** Item Reviews */
    reviews?: IaItemReview[]; // TODO
};

export type ItemDataKey = keyof IaItemData;
