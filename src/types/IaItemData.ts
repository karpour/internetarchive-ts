import { IaItemReview } from "./IaItemReview";
import { IaItemMetadata } from "./IaItemMetadata";
import { IaFileExtendedMetadata } from "./IaFileMetadata";
import { RawMetadataOptional, StringOrStringArray } from ".";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type IaItemDataRaw = {
    [key in keyof IaItemData]:
    (IaItemData[key] extends Array<Record<string, any>> ?
        Array<RawMetadataOptional<IaItemData[key][number]>> :
        (IaItemData[key] extends Record<string, any> ?
            RawMetadataOptional<IaItemData[key]> :
            StringOrStringArray<IaItemData[key]>
        )
    );
};

export type IaSimplelistEntry = {



};

export type IaFilesXmlMetadata = Omit<Optional<IaFileExtendedMetadata, 'mtime' | 'size'>, 'name'> & { name: `${string}_files.xml`; };

export type IaItemData = {
    /** Date the item was created on */
    created: number;
    /** The primary data node the item is stored on */
    d1?: string;
    /** The secondary (backup) data node the item is stored on (unless stored on a solo node) */
    d2?: string;
    /** The item's absolute pathname (on both data nodes) */
    dir: string;
    /** Total number of files in the item */
    files_count: number; // conv
    /** The time when the item was last modified */
    item_last_updated: number; // conv
    /** Total size in bytes of all files in the item */
    item_size: number; // conv
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
    /** Item Metadata */
    metadata: IaItemMetadata;
    /** Item Reviews */
    reviews?: IaItemReview[]; // todo
    /**  */
    files: (IaFileExtendedMetadata | IaFilesXmlMetadata)[];
};

