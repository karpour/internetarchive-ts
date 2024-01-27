import { IaMediaType, IaCollectionId } from ".";

export type IaItemBaseMetadata = {
    /** Unique identifier for an item on the archive.org web site. Used in the URL for the item, ie archive.org/details/[identifier]. */
    identifier: string;
    /** Mediatype tells us about the main content of the item. It is used to determine how the item is displayed on the web site and may trigger special processing depending on the types of files contained in the item. */
    mediatype: IaMediaType;
    /** 2019-12 and later dates: represents time item was added to public search engine. 
     * Earlier dates: Date and time in UTC that the item was created */
    addeddate?: string;
    /** The date and time in UTC that the item was created on archive.org. */
    publicdate?: string;
    /** Indicates to the website what collection(s) this item belongs to. */
    collection: IaCollectionId | IaCollectionId[];
};

export type IaItemMetadata = IaItemBaseMetadata & {
    // Optional fields
    /** Date of publication */
    date?: string;
    /** Title of media */
    title?: string;
    /** Describes the media stored in the item. Description can contain HTML */
    description?: string;
    /** Email address of the account that uploaded the item to archive.org. */
    uploader?: string;
    /** Subjects and/or topics covered by the media content */
    subject?: string | string[];
    /** The person or organization that provided the physical or digital media. */
    contributor?: string;
    /** The individual(s) or organization that created the media content. */
    creator?: string | string[];
    /** The language the media is written or recorded in. */
    language?: string | string[];
    /** The date and time in UTC that the media was captured. */
    scandate?: string;
    /** Imagecount gives an indication of the size of the content of an item (outside of file size, which is represented in the size field). 
     * Originally used only for books, the field has been repurposed over time to provide similar information for other mediatypes. */
    imagecount?: string;
    /** The person or organization that funded the digitization or collection of this media. */
    sponsor?: string;
    /** Machinery used to digitize or collect the media */
    scanner?: string;
    /** Source of media */
    source?: string;
    /** Indicates the current state of a scanned book. */
    repub_state?: string;
    /** Collection contents are restricted access */
    access_restricted?: string;
    /** Collection file formats that are available to users in an Access Restricted collection */
    public_format?: string | string[];
    /** Identifies item that is access-restricted */
    access_restricted_item?: string;
    /** The location where a digital copy of the media item was created */
    scanningcenter?: string;
    /** Software package and version used for optical character recognition */
    ocr?: string;
    /** Prevents item from being indexed in public archive.org search engine */
    noindex?: string;
    /** Prevents RePublisher from removing noindex at the end of the texts digitization process. */
    neverindex?: string;
    /** Pixels per inch */
    ppi?: string;
    /** Curation state and notes */
    curation?: string;
    /** Length of an audio or video item */
    runtime?: string | string[];
    /** Publisher of the media */
    publisher?: string;
    /** Indicates whether media has sound or is silent */
    sound?: string;
    /** Indicates whether media is in color or black and white */
    color?: string;
    /** Start time of program in broadcast time zone */
    start_localtime?: string;
    /** Start time of program in UTC */
    start_time?: string;
    /** Stop time of program in UTC */
    stop_time?: string;
    /** Offset between local time and UTC */
    utc_offset?: string;
    /** Program used to decode audio stream */
    audio_codec?: string;
    /** Samples per second */
    audio_sample_rate?: string;
    /** Program used to decode video stream */
    video_codec?: string;
    /** Frequency at which consecutive images are displayed */
    frames_per_second?: string;
    /** Pixel width of original video stream */
    source_pixel_width?: string;
    /** Pixel height of original video stream */
    source_pixel_height?: string;
    /** Ratio of the pixel width and height of a video stream */
    aspect_ratio?: string;
    /** Indicates whether item contains closed captioning files */
    closed_captioning?: string;
    /** Indicates which closed captioning file should be used for display and search */
    ccnum?: string;
    /** Virtual Channel the video was recorded from */
    tuner?: string;
    /** Screen name of the account that updated the item */
    updater?: string | string[];
    /** Date the item was updated by updater */
    updatedate?: string | string[];
    /** Timestamp in the metadata table for the last time the item’s row in that table was written */
    updated?: string | string[];
    /** Email of the person who scanned/captured the media in the item */
    operator?: string;
    /** Number of fold outs captured by operator */
    foldoutcount?: string;
    /** URLs or identifiers to outside resources that represent the media */
    external_identifier?: string | string[];
    /** URLs or identifiers to resources related to the media, but not representing this exact form of the work */
    related_external_id?: string | string[];
    /** Determines direction pages will be "turned" in a book */
    page_progression?: string;
    /** IA identifier of previous item from a recorded feed */
    previous_item?: string;
    /** IA identifier of next item from a recorded feed */
    next_item?: string;
    /** URL of the selected license */
    licenseurl?: string;
    /** Billing date for scanned materials */
    sponsordate?: string;
    /** Location of physical item in the Physical Archive */
    boxid?: string | string[];
    /** Indicates whether the bookreader should display one or two pages by default */
    bookreader_defaults?: string;
    /** Indicates that the derive module should create a higher quality PDF derivative (distinguishes text from background better). */
    betterpdf?: string;
    /** Deprecated. Email of the person who completed republishing the item */
    republisher?: string;
    /** Email of the person who completed republishing the item */
    republisher_operator?: string;
    /** Date and time in UTC that the item was created archive.org */
    republisher_date?: string;
    /** Number of seconds required to republish text */
    republisher_time?: string;
    /** Camera model used during digitization process */
    camera?: string;
    /** Identifier of same edition in OCLC records */
    oclc_id?: string | string[];
    /** Hides collection from top level navigation */
    hidden?: string;
    /** Archival Resource Key identifier */
    identifier_ark?: string;
    /** Deprecated. Open Library edition identifier */
    openlibrary?: string;
    /** Open Library edition identifier */
    openlibrary_edition?: string;
    /** Open Library work identifier */
    openlibrary_work?: string;
    /** Open Library subject */
    openlibrary_subject?: string | string[];
    /** Open Library author */
    openlibrary_author?: string | string[];
    /** Volume number or name */
    volume?: string;
    /** Information relevant to copyright status */
    possible_copyright_status?: string;
    /** Contributing library’s local call number */
    call_number?: string;
    /** Scanning fee used during billing process */
    scanfee?: string;
    /** Library of Congress Call Number */
    lccn?: string | string[];
    /** ISBN-10 or ISBN-13 */
    isbn?: string | string[];
    /** Causes virus check task to run on any item added to the collection */
    viruscheck?: true;
    /** Last file date */
    lastfiledate?: string;
    /** First file date */
    firstfiledate?: string;
    /** Condition of media */
    condition?: string;
    /** Condition of the artwork or printed materials that accompany a media item */
    condition_visual?: string;
    /** Additional notes about the item */
    notes?: string | string[];

    // These fields aren't officially documented, but still appear in results
    /**  */
    'identifier-access'?: string;
    /** */
    coverleaf?: string;
    /**  */
    pick?: string;
    /**  */
    segments?: string;
    /**  */
    numeric_id?: string; //conv

    /**  */
    type?: string;
    /**  */
    proddate?: string;
    /**  */
    collectionid?: string;
    /**  */
    backup_location?: string;
    /** */
    year?: string;

    search_collection?: string;

    issn?: string;

    "identifier-ark"?: string;

    ocr_parameters?: string;
    ocr_module_version?: string;
    ocr_detected_script?: string;
    ocr_detected_script_conf?: string;
    ocr_detected_lang?: string;
    ocr_detected_lang_conf?: string;
};
