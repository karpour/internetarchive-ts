
export type IaSearchResult<FieldNames extends readonly string[] | string[] = string[]> = {
    responseHeader: {
        status: number,
        QTime: number,
        params: {
            query: string,
            qin: string,
            fields: string,
            wt: string,
            rows: string,
            start: number;
        };
    },
    response: {
        numFound: number,
        start: number,
        docs: IaSearchResponseItem<FieldNames>[];
    };
};

export const IA_SEARCH_FIELDS = [
    "avg_rating",
    "backup_location",
    "btih",
    "call_number",
    "collection",
    "contributor",
    "coverage",
    "creator",
    "date",
    "description",
    "downloads",
    "external",
    "foldoutcount",
    "format",
    "genre",
    "identifier",
    "imagecount",
    "indexflag",
    "item_size",
    "language",
    "licenseurl",
    "mediatype",
    "members",
    "month",
    "name",
    "noindex",
    "num_reviews",
    "oai_updatedate",
    "publicdate",
    "publisher",
    "related",
    "reviewdate",
    "rights",
    "scanningcentre",
    "source",
    "stripped_tags",
    "subject",
    "title",
    "type",
    "volume",
    "week",
    "year"
] as const;

type IaNumberSearchResultFields =
    "downloads" |
    "week" |
    "year" |
    "month" | 
    "item_size";

type IaNeverUndefinedSearchResultFields =
"identifier" | 
"item_size";

type IaSearchItemValue<KEY extends string> = KEY extends IaNumberSearchResultFields ? number : string|string[];


type IaSearchField = typeof IA_SEARCH_FIELDS[number];


export const fields = ["aa", "bbb", "item_size"] as const;

export type IaSearchResponseItem<FieldNames extends readonly string[] | string[] = string[]> =
    { [key in FieldNames[number]]: key extends IaNumberSearchFields ? number : string | string[] | number | undefined; } & {};

type test = IaSearchResponseItem<typeof fields>;

function getP<FieldNames extends readonly string[]>(fieldnames: FieldNames): IaSearchResponseItem<FieldNames> {
    return {} as IaSearchResponseItem<FieldNames>;
}

const a = getP(fields);


const rocket = {
    "btih": "bb989008a852c3bfae1cf6d68a3df6c3933634eb",
    "collection": [
        "opensource"
    ],
    "creator": "NuvoMedia, Inc.",
    "date": "2000-01-01T00:00:00Z",
    "description": "Quick Start Guide for the NuvoMedia Rocket eBook.",
    "downloads": 10,
    "format": [
        "Archive BitTorrent",
        "DjVuTXT",
        "Djvu XML",
        "Item Tile",
        "Metadata",
        "OCR Page Index",
        "OCR Search Text",
        "Page Numbers JSON",
        "Scandata",
        "Single Page Processed JP2 ZIP",
        "Text PDF",
        "chOCR",
        "hOCR"
    ],
    "identifier": "rocket-ebook-quickstart-guide",
    "indexflag": [
        "index",
        "nonoindex",
        "uncurated"
    ],
    "item_size": 11913375,
    "language": "eng",
    "mediatype": "texts",
    "month": 3,
    "oai_updatedate": [
        "2023-12-04T00:37:44Z",
        "2023-12-04T01:25:01Z"
    ],
    "ocr_detected_lang": "en",
    "publicdate": "2023-12-04T00:37:44Z",
    "subject": [
        "rocket ebook",
        "manual",
        "guide"
    ],
    "title": "NuvoMedia Rocket eBook Quickstart Guide",
    "week": 0,
    "year": 2000
};

const result: IaSearchResult = {
    "responseHeader": {
        "status": 0,
        "QTime": 328,
        "params": {
            "query": "(( ( (title:nasa^100 OR salients:nasa^50 OR subject:nasa^25 OR description:nasa^15 OR collection:nasa^10 OR language:nasa^10 OR text:nasa^1) ) AND !collection:(podcasts OR radio OR uspto))^2 OR ( ( (title:nasa^100 OR salients:nasa^50 OR subject:nasa^25 OR description:nasa^15 OR collection:nasa^10 OR language:nasa^10 OR text:nasa^1) ) AND collection:(podcasts OR radio OR uspto))^0.5)",
            "qin": "nasa",
            "fields": "avg_rating,backup_location,btih,call_number,collection,contributor,coverage,creator,date,description,downloads,external-identifier,foldoutcount,format,genre,identifier,imagecount,indexflag,item_size,language,licenseurl,mediatype,members,month,name,noindex,num_reviews,oai_updatedate,publicdate,publisher,related-external-id,reviewdate,rights,scanningcentre,source,stripped_tags,subject,title,type,volume,week,year",
            "wt": "json",
            "rows": "50",
            "start": 0
        }
    },
    "response": {
        "numFound": 586117,
        "start": 0,
        "docs": [
            {
                "backup_location": "ia903604_2",
                "btih": "97720ca5a6c1ba6fdee24f9f7b8f52665f65dc71",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-carmen_dom_nguez",
                    "fav-coolmanforever",
                    "fav-frankonaut",
                    "fav-grandpsswagger",
                    "fav-hunsky",
                    "fav-laneylu3",
                    "fav-rogerio_matos_mineiro_",
                    "fav-william871"
                ],
                "creator": "NASA eClips",
                "description": "Find out how NASA technology is being used in your own home.",
                "downloads": 111897,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_360_12_HD",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "NASA_360_12_HD",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 2844086608,
                "language": "english",
                "mediatype": "movies",
                "month": 6,
                "oai_updatedate": [
                    "2009-10-07T21:02:42Z",
                    "2009-10-07T21:36:48Z",
                    "2009-10-07T21:36:55Z",
                    "2010-03-22T21:16:32Z",
                    "2023-07-06T15:40:09Z"
                ],
                "publicdate": "2009-10-07T21:36:48Z",
                "subject": [
                    "NASA",
                    "NASA 360",
                    "NIA",
                    "NASA eClips"
                ],
                "title": "NASA 360: NASA in Your Home",
                "week": 2
            },
            {
                "backup_location": "ia905304_10",
                "collection": [
                    "opensource_audio",
                    "community",
                    "fav-jadenew"
                ],
                "creator": "NASA",
                "description": "NASA @ Soundcloud",
                "downloads": 816,
                "format": [
                    "Columbia Peaks",
                    "Essentia High GZ",
                    "Essentia Low GZ",
                    "Flac",
                    "Item Tile",
                    "Metadata",
                    "Ogg Vorbis",
                    "PNG",
                    "Spectrogram",
                    "VBR MP3",
                    "WAVE"
                ],
                "identifier": "soundcloud.com-nasa",
                "indexflag": [
                    "index",
                    "nonoindex",
                    "uncurated"
                ],
                "item_size": 48394977,
                "mediatype": "audio",
                "month": 14,
                "oai_updatedate": [
                    "2015-04-16T16:15:38Z",
                    "2021-02-19T00:36:54Z"
                ],
                "publicdate": "2015-04-16T16:15:38Z",
                "subject": [
                    "nasa",
                    "space"
                ],
                "title": "soundcloud.com/nasa",
                "week": 11
            },
            {
                "backup_location": "ia903603_24",
                "btih": "312dbad4cbbf60da6036d3f6ad03008b996b478a",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-carmen_dom_nguez"
                ],
                "creator": "NASA eClips",
                "description": "In episode 11, find out how athletes are being helped by NASA technology.",
                "downloads": 1111,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_360_11_HD",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "NASA_360_11_HD",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 1906449456,
                "language": "english",
                "mediatype": "movies",
                "month": 3,
                "oai_updatedate": [
                    "2009-08-11T13:10:48Z",
                    "2009-08-11T13:12:21Z",
                    "2009-08-11T13:12:37Z",
                    "2010-03-22T21:32:53Z",
                    "2023-07-06T15:40:30Z"
                ],
                "publicdate": "2009-08-11T13:12:21Z",
                "subject": [
                    "NASA",
                    "NASA 360",
                    "NASA eClips",
                    "athletes",
                    "NIA",
                    "Katie Hoff",
                    "Katherine Hull",
                    "Sandra Fowkes Godek",
                    "Lance Prinzel",
                    "sporting equipment",
                    "ingestible thermometer"
                ],
                "title": "NASA 360: NASA and Pro Athletes",
                "week": 2
            },
            {
                "collection": [
                    "apkarchive",
                    "phonesoftware"
                ],
                "creator": "Nasa IPTV Gold",
                "date": "2020-09-29T00:00:00Z",
                "description": "Nasa IPTV Gold",
                "downloads": 2010,
                "format": [
                    "Android Package Archive",
                    "Archive BitTorrent",
                    "Metadata"
                ],
                "identifier": "nasa.apk",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 161697790,
                "language": "eng",
                "mediatype": "software",
                "month": 0,
                "oai_updatedate": [
                    "2020-09-29T17:43:54Z",
                    "2021-05-19T20:39:57Z"
                ],
                "publicdate": "2020-09-29T17:43:54Z",
                "subject": "Nasa IPTV Gold",
                "title": "nasa",
                "week": 0,
                "year": 2020
            },
            {
                "backup_location": "ia903604_22",
                "btih": "38f4f6cf85d202f13824bae082c9f38f5e22bc6c",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "Alan Ladwig, senior advisor to the NASA Administator, far left, makes a point as he introduces NASA Administrator Charles F. Bolden Jr. and Deputy Administrator Lori Garver at a NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 83,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210032HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 24946426,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:14Z",
                    "2010-01-01T20:51:47Z",
                    "2010-01-01T19:35:09Z",
                    "2018-07-05T10:27:20Z"
                ],
                "publicdate": "2010-01-01T20:51:47Z",
                "rights": "Public Domain",
                "subject": [
                    "Alan Ladwig Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. left on stage, speaks during his first NASA Update as Deputy Administrator Lori Garver looks on at right,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 58,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210034HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 32363234,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:19Z",
                    "2010-01-01T20:52:29Z",
                    "2010-01-01T19:35:12Z",
                    "2017-04-25T00:55:13Z"
                ],
                "publicdate": "2010-01-01T20:52:29Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "3d3c316075c4cb9c423cade3ce22632837882fa7",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Deputy Administrator Lori Garver makes a point as she speaks during a NASA Update with Administrator Charles F. Bolden Jr.,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 117,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210029HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 29632744,
                "mediatype": "image",
                "month": 4,
                "oai_updatedate": [
                    "2010-01-01T20:08:06Z",
                    "2010-01-01T20:50:21Z",
                    "2010-01-01T19:35:06Z",
                    "2018-07-08T21:04:08Z"
                ],
                "publicdate": "2010-01-01T20:50:21Z",
                "rights": "Public Domain",
                "subject": [
                    "Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Deputy Administrator Lori Garver, second right on stage, speaks as NASA Administrator Charles F. Bolden Jr. looks on during a NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 68,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210037HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 35104550,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:27Z",
                    "2010-01-01T20:53:58Z",
                    "2010-01-01T19:35:16Z",
                    "2018-07-06T13:21:46Z"
                ],
                "publicdate": "2010-01-01T20:53:58Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "avg_rating": 5,
                "backup_location": "ia903700_33",
                "btih": "c35314f2859bbf230cb04a86eed5d3f2e863fed2",
                "collection": [
                    "nasaaudiocollection",
                    "nasa",
                    "fav-amgrafixstudio",
                    "fav-axgmz",
                    "fav-bkotrla",
                    "fav-carissatikalsky",
                    "fav-chosenfewtodie",
                    "fav-coquitonia",
                    "fav-cortex9",
                    "fav-dayquan_moeller",
                    "fav-folbau",
                    "fav-jipiduu",
                    "fav-justin_prutsman",
                    "fav-koobez",
                    "fav-misbah_zahid",
                    "fav-n2killu",
                    "fav-picture_engine",
                    "fav-piercal65"
                ],
                "creator": "NASA",
                "description": "NASA launches and landings, recorded at the Kennedy Space Center. Originally recorded by Andrew L. Klausman. Digitized, cataloged and archived by the Houston Audio Control Room, at the NASA Johnson Space Center.",
                "downloads": 12639,
                "format": [
                    "Archive BitTorrent",
                    "Checksums",
                    "Flac",
                    "Flac FingerPrint",
                    "Item Tile",
                    "Metadata",
                    "Ogg Vorbis",
                    "PNG",
                    "VBR MP3",
                    "WAVE"
                ],
                "identifier": "NasaLaunchAudio",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 1030557694,
                "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/",
                "mediatype": "audio",
                "month": 29,
                "num_reviews": 1,
                "oai_updatedate": [
                    "2011-06-22T15:20:14Z",
                    "2011-06-22T17:16:33Z",
                    "2019-04-09T23:14:02Z",
                    "2012-03-05T17:36:37Z"
                ],
                "publicdate": "2011-06-22T17:16:33Z",
                "reviewdate": "2012-03-05T17:36:37Z",
                "subject": "NASA",
                "title": "NASA Launch Audio",
                "week": 11
            },
            {
                "backup_location": "ia905301_25",
                "btih": "3a1c2608e69fcb08a652bb10af88ca7374ebc8eb",
                "collection": [
                    "jsc-pao-video-collection",
                    "nasa",
                    "fav-jalbertbowdenii",
                    "fav-carmen_dom_nguez"
                ],
                "creator": "NASA",
                "description": "Women @ NASA.",
                "downloads": 872,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:Women-at-NASA",
                "format": [
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "Women-at-NASA",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 1282605295,
                "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/",
                "mediatype": "movies",
                "month": 1,
                "oai_updatedate": [
                    "2015-02-26T16:31:50Z",
                    "2023-07-06T15:50:39Z"
                ],
                "publicdate": "2015-02-26T16:31:50Z",
                "subject": "NASA",
                "title": "Women @ NASA",
                "week": 1
            },
            {
                "backup_location": "ia903604_22",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. speaks during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator, was joined by Deputy Administrator Lori Garver where they took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 96,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210020HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 15011879,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:43Z",
                    "2010-01-01T20:47:55Z",
                    "2010-01-01T19:34:55Z",
                    "2017-04-25T00:54:53Z"
                ],
                "publicdate": "2010-01-01T20:47:55Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "206c0c1ba3a1621a73d1fa4153394d9363204299",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. is seen on a television camera monitor while speaking at his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator, was joined by Deputy Administrator Lori Garver where they took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 66,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210021HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 24109572,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:46Z",
                    "2010-01-01T20:48:05Z",
                    "2010-01-01T19:34:56Z",
                    "2017-04-25T00:54:54Z"
                ],
                "publicdate": "2010-01-01T20:48:05Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia906200_5",
                "collection": [
                    "nasaaudiocollection",
                    "nasa",
                    "fav-davidarb",
                    "fav-hepup"
                ],
                "creator": "NASA",
                "date": "1983-09-01T00:00:00Z",
                "description": "NASA Special Report. October 1983. Program #227. NASA syndication. \"Visions Of The Future\". Sustaining. Jesco von Puttkamer (NASA HQ). 14:30.  The Space Story. September 16, 1983. Program #1034 to 1037. NASA syndication. Sustaining. 1034. \"NASA's First 25 Years: A Prelude to Tomorrow,\" with James Beggs (NASA Administrator) 1035. \"The Shuttle Revolution,\" with Gen. Abrahamson (NASA HQ) 1036. \"Searching For Life Elsewhere,\" with Dr. Gerald Soffen and Dr. John Billingham 1037. \"Adapting To The Space Environment,\" with Dr. Gerald Soffen James Beggs, General Abrahamson, Gerald Soffen, John Billingham.  Digitized by Kevin Savetz, savetz.com",
                "downloads": 1448,
                "format": [
                    "Archive BitTorrent",
                    "Columbia Peaks",
                    "Flac",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "Ogg Vorbis",
                    "PNG",
                    "Spectrogram",
                    "VBR MP3",
                    "WAVE"
                ],
                "identifier": "NASA227",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 2114462266,
                "language": "eng",
                "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/",
                "mediatype": "audio",
                "month": 9,
                "oai_updatedate": [
                    "2016-06-08T18:30:12Z",
                    "2022-08-29T22:55:18Z"
                ],
                "publicdate": "2016-06-08T18:30:12Z",
                "subject": [
                    "NASA",
                    "NASA history"
                ],
                "title": "NASA NASA Special Report 227/Space Story 1034-1037",
                "week": 6,
                "year": 1983
            },
            {
                "backup_location": "ia903601_15",
                "btih": "f9cc10be6b18e3b854948dfc99ee07c8753fe811",
                "collection": [
                    "opensource_movies",
                    "community",
                    "fav-16ar",
                    "fav-abracaawesome",
                    "fav-gerald_law_ii",
                    "fav-kateeredd",
                    "fav-kirn111",
                    "fav-mafmadmaf",
                    "fav-mauriciocv",
                    "fav-michael_charteris",
                    "fav-s_bell",
                    "fav-sciencefictionfan2008",
                    "fav-therminalc"
                ],
                "creator": "NASA",
                "description": "NASA SPACE SUHTLLE LIFT OFF",
                "downloads": 17106,
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "MPEG4",
                    "Metadata",
                    "Ogg Video",
                    "Thumbnail"
                ],
                "identifier": "NasaSpaceLiftoff",
                "indexflag": [
                    "index",
                    "nonoindex",
                    "uncurated"
                ],
                "item_size": 37486422,
                "mediatype": "movies",
                "month": 7,
                "oai_updatedate": [
                    "2007-11-29T14:28:30Z",
                    "2007-11-29T14:33:17Z",
                    "2021-02-17T07:55:00Z"
                ],
                "publicdate": "2007-11-29T14:33:17Z",
                "subject": "NASA",
                "title": "nasa space liftoff",
                "week": 4
            },
            {
                "backup_location": "ia903604_22",
                "btih": "9cb1a764355ea9b1adf26baa3366b50bb4037f08",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "Alan Ladwig, Senior Advisor to the NASA Administrator, introduces Administrator Charles F. Bolden Jr. and Deputy Administrator Lori Garver at a NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, the agency's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 115,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210017HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 28716659,
                "mediatype": "image",
                "month": 2,
                "oai_updatedate": [
                    "2010-01-01T20:07:35Z",
                    "2010-01-01T20:47:05Z",
                    "2010-01-01T19:34:51Z",
                    "2018-07-03T06:02:33Z"
                ],
                "publicdate": "2010-01-01T20:47:05Z",
                "rights": "Public Domain",
                "subject": [
                    "Alan Ladwig NASA Headquarters NASA Update Washington, DC",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "fbe8f7811f1b98dccb6051558aafc0c2c0bbb9a9",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr., left on stage speaks during his first NASA Update as Deputy Administrator Lori Garver looks on at right,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 71,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210036HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 34929297,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:24Z",
                    "2010-01-01T20:53:48Z",
                    "2010-01-01T19:35:14Z",
                    "2018-07-06T03:42:59Z"
                ],
                "publicdate": "2010-01-01T20:53:48Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "666e7689151c82eb162f4320d8a9c67e3b7c90d8",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. speaks during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator, was joined by Deputy Administrator Lori Garver where they took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 74,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210019HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 31970051,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:40Z",
                    "2010-01-01T20:47:44Z",
                    "2010-01-01T19:34:54Z",
                    "2018-07-03T08:09:03Z"
                ],
                "publicdate": "2010-01-01T20:47:44Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "59fb4cb2c66df2abebf0de8d826ca2a35034a470",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. speaks during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator, was joined by Deputy Administrator Lori Garver where they took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 76,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210023HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 16989247,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:51Z",
                    "2010-01-01T20:48:47Z",
                    "2010-01-01T19:34:59Z",
                    "2017-04-25T00:54:54Z"
                ],
                "publicdate": "2010-01-01T20:48:47Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Deputy Administrator Lori Garver, right, looks on as NASA Administrator Charles F. Bolden Jr. speaks during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 76,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210026HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 20152180,
                "mediatype": "image",
                "month": 1,
                "oai_updatedate": [
                    "2010-01-01T20:07:58Z",
                    "2010-01-01T20:49:40Z",
                    "2010-01-01T19:35:02Z",
                    "2017-04-25T00:55:01Z"
                ],
                "publicdate": "2010-01-01T20:49:40Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 1,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "4705e538bf71fa39dda8c7d0ac21d7e483c22434",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Deputy Administrator Lori Garver, right, smiles as NASA Administrator Charles F. Bolden Jr. speaks during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 90,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210027HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 23319672,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:01Z",
                    "2010-01-01T20:49:59Z",
                    "2010-01-01T19:35:04Z",
                    "2017-04-25T00:55:01Z"
                ],
                "publicdate": "2010-01-01T20:49:59Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "1d4a1cd7e3b6b654a8b90223d894cbc9178e7bdd",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr., left, speaks during aNASA Update as Deputy Administrator Lori Garver looks on,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 72,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210033HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 28133025,
                "mediatype": "image",
                "month": 1,
                "oai_updatedate": [
                    "2010-01-01T20:08:17Z",
                    "2010-01-01T20:52:10Z",
                    "2010-01-01T19:35:11Z",
                    "2018-07-06T08:58:20Z"
                ],
                "publicdate": "2010-01-01T20:52:10Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_0",
                "btih": "4f315fbcaa1d7ab8547a5460484c3f384a0d023e",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-carmen_dom_nguez"
                ],
                "creator": "NASA",
                "description": "NASA_Launchpad_SRBs_HD.mov",
                "downloads": 375,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_Launchpad_Perigee_HD.mov",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "NASA_Launchpad_Perigee_HD.mov",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 533622519,
                "mediatype": "movies",
                "month": 0,
                "oai_updatedate": [
                    "2009-10-02T20:13:48Z",
                    "2009-10-02T20:37:47Z",
                    "2023-07-06T15:40:19Z"
                ],
                "publicdate": "2009-10-02T20:37:47Z",
                "subject": "NASA_Launchpad_SRBs_HD.mov",
                "title": "NASA_Launchpad_SRBs_HD.mov",
                "week": 0
            },
            {
                "collection": [
                    "opensource_image",
                    "community"
                ],
                "creator": "NASA",
                "date": "2021-07-08T00:00:00Z",
                "description": "Écusson NASA mis en archive par NASA SHOP FRANCE® pour mémoire en téléchargement libre non commercial. Notre boutique de vêtement se dédie exclusivement à l'univers de la National Aeronautic and Space Administration.",
                "downloads": 212,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG Thumb",
                    "Metadata",
                    "PNG"
                ],
                "identifier": "ecusson-nasa",
                "indexflag": [
                    "index",
                    "nonoindex",
                    "uncurated"
                ],
                "item_size": 54903027,
                "language": "fre",
                "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/",
                "mediatype": "image",
                "month": 17,
                "oai_updatedate": [
                    "2021-07-08T05:32:30Z",
                    "2021-07-08T05:35:43Z"
                ],
                "publicdate": "2021-07-08T05:32:30Z",
                "stripped_tags": "a href=\"https://www.nasa-shop.fr/\" rel=\"nofollow\"",
                "subject": "Ecussion NASA Libre de droit et non commercialisable",
                "title": "Ecussion NASA",
                "week": 5,
                "year": 2021
            },
            {
                "backup_location": "ia903604_22",
                "btih": "dc35bc61edec91f2929fba78bcf1918e4f7dbac9",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. left, speaks during his first NASA Update as Deputy Administrator Lori Garver looks on,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 87,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210024HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 32922404,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:53Z",
                    "2010-01-01T20:49:17Z",
                    "2010-01-01T19:35:00Z",
                    "2018-07-03T20:03:35Z"
                ],
                "publicdate": "2010-01-01T20:49:17Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "2bddea6a5c67b3f3374eae78a711697b0cd33401",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr., left, looks on as Deputy Administrator Lori Garver speaks during a NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 69,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210030HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 23283932,
                "mediatype": "image",
                "month": 1,
                "oai_updatedate": [
                    "2010-01-01T20:08:09Z",
                    "2010-01-01T20:51:05Z",
                    "2010-01-01T19:35:07Z",
                    "2018-07-04T12:04:21Z"
                ],
                "publicdate": "2010-01-01T20:51:05Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "784c3f914dcdffef9dc314da4b22f525ec25bb16",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. left, and Deputy Administrator Lori Garver are seen during their first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 83,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210018HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 26890127,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:38Z",
                    "2010-01-01T20:47:14Z",
                    "2010-01-01T19:34:53Z",
                    "2018-07-08T23:24:07Z"
                ],
                "publicdate": "2010-01-01T20:47:14Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "ce59387b6fa16dc14371d4a382e15a516424e1c4",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. looks over his notes during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator, was joined by Deputy Administrator Lori Garver where they took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 75,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210025HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 26231539,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:56Z",
                    "2010-01-01T20:49:46Z",
                    "2010-01-01T19:35:01Z",
                    "2018-07-11T01:06:44Z"
                ],
                "publicdate": "2010-01-01T20:49:46Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "401a9b0209c8ab1aabeb31cdbdcb6b2ccdecac4e",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. is seen through a television camera monitor during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator, was joined by Deputy Administrator Lori Garver where they took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 51,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210022HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 22141306,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:07:48Z",
                    "2010-01-01T20:48:26Z",
                    "2010-01-01T19:34:57Z",
                    "2017-04-25T00:54:55Z"
                ],
                "publicdate": "2010-01-01T20:48:26Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia905900_11",
                "collection": [
                    "opensource_audio",
                    "community"
                ],
                "creator": "NASA 1x04.",
                "description": "NASA 1x04.",
                "downloads": 7141,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Vorbis",
                    "PNG",
                    "VBR MP3"
                ],
                "identifier": "Nasa1x04",
                "indexflag": [
                    "index",
                    "nonoindex",
                    "uncurated"
                ],
                "item_size": 37428381,
                "licenseurl": "http://creativecommons.org/publicdomain/zero/1.0/",
                "mediatype": "audio",
                "month": 1,
                "oai_updatedate": [
                    "2014-07-10T06:25:04Z",
                    "2014-07-10T06:25:10Z",
                    "2021-02-17T07:53:24Z"
                ],
                "publicdate": "2014-07-10T06:25:10Z",
                "subject": "NASA 1x04.",
                "title": "NASA 1x04.",
                "week": 1
            },
            {
                "backup_location": "ia903604_22",
                "btih": "b07dbdb9692f4472051ba9e631afdb701c2b0611",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. left, speaks during his first NASA Update as Deputy Administrator Lori Garver looks on,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 83,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210028HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 26341385,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:03Z",
                    "2010-01-01T20:51:16Z",
                    "2010-01-01T19:35:05Z",
                    "2018-07-07T00:13:55Z"
                ],
                "publicdate": "2010-01-01T20:51:16Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "20cabf0eea7f83eb0e29d7ab13f826e3fcc5eeae",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr. speaks during his first NASA Update,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Lori Garver, the Deputy Administrator, took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 98,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210031HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 24386097,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:11Z",
                    "2010-01-01T20:51:18Z",
                    "2010-01-01T19:35:08Z",
                    "2018-07-08T02:39:14Z"
                ],
                "publicdate": "2010-01-01T20:51:18Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "687f6392bb48853137885cf964a72f28342de1a9",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr., left on stage, speaks during his first NASA Update as Deputy Administrator Lori Garver looks on at right,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 54,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210035HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 34315980,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:22Z",
                    "2010-01-01T20:53:08Z",
                    "2010-01-01T19:35:13Z",
                    "2017-04-25T00:55:02Z"
                ],
                "publicdate": "2010-01-01T20:53:08Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "backup_location": "ia903604_22",
                "btih": "a8afa445e121e88a0756ad5fc5c2141ef89bc05c",
                "collection": [
                    "nasa",
                    "nasaheadquartersflickrstream"
                ],
                "creator": "NASA/Bill Ingalls",
                "date": "2009-07-21T00:00:00Z",
                "description": "NASA Administrator Charles F. Bolden Jr., left on stage, speaks during his first NASA Update as Deputy Administrator Lori Garver looks on,Tuesday, July 21, 2009, at NASA Headquarters in Washington. Bolden, NASA's 12th Administrator and Garver took the time to introduce themselves and outline their vision for the agency going forward. No questions were taken during the session. Photo Credit: (NASA/Bill Ingalls)",
                "downloads": 49,
                "format": [
                    "Archive BitTorrent",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "TIFF"
                ],
                "identifier": "200907210038HQ",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 26485102,
                "mediatype": "image",
                "month": 0,
                "oai_updatedate": [
                    "2010-01-01T20:08:30Z",
                    "2010-01-01T20:54:04Z",
                    "2010-01-01T19:35:17Z",
                    "2017-04-25T00:55:02Z"
                ],
                "publicdate": "2010-01-01T20:54:04Z",
                "rights": "Public Domain",
                "subject": [
                    "Charles Bolden Deputy Administrator Lori Garver NASA Headquarters NASA Update Washington, DC",
                    "Who -- Charles Bolden",
                    "Where -- NASA Headquarters"
                ],
                "title": "NASA Update",
                "week": 0,
                "year": 2009
            },
            {
                "avg_rating": 5,
                "backup_location": "ia903602_30",
                "btih": "636ff234cf84569cc86ca40d2d6217a16f6a805c",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-anthonyjohn17",
                    "fav-carmen_dom_nguez",
                    "fav-courtney_b_",
                    "fav-delicieux",
                    "fav-matteojet",
                    "fav-me_anms",
                    "fav-momofuji",
                    "fav-sciencefictionfan2008",
                    "fav-tdn2011"
                ],
                "creator": "NASA",
                "date": "2009-01-01T00:00:00Z",
                "description": "Nasa eClips Video Series",
                "downloads": 184152,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:nasa_eclips_022709",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Flash Video",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "ZIP",
                    "h.264"
                ],
                "identifier": "nasa_eclips_022709",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 2756864027,
                "mediatype": "movies",
                "month": 11,
                "num_reviews": 2,
                "oai_updatedate": [
                    "2009-02-27T21:36:25Z",
                    "2009-02-28T04:39:40Z",
                    "2009-02-28T04:41:52Z",
                    "2009-03-16T19:39:27Z",
                    "2023-10-31T14:21:20Z",
                    "2018-08-10T19:08:23Z"
                ],
                "publicdate": "2009-02-28T04:39:40Z",
                "reviewdate": "2018-08-10T19:08:23Z",
                "subject": "Nasa eClips",
                "title": "Nasa eClips Video",
                "week": 3,
                "year": 2009
            },
            {
                "collection": [
                    "social-media-video",
                    "additional_collections_video"
                ],
                "creator": "NASA",
                "date": "2022-01-01T00:00:00Z",
                "description": "An archive of videos from the Odysee channel \"NASA\" from 2022. * channel_id: 88c88419f2991692cc754debaaae485f1cf2a6d9 * uploader: NASA",
                "downloads": 133,
                "format": [
                    "Item Tile",
                    "JPEG",
                    "JSON",
                    "Matroska",
                    "Metadata",
                    "Unknown"
                ],
                "identifier": "odysee_-_nasa_2022",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 4420343097,
                "mediatype": "movies",
                "month": 4,
                "oai_updatedate": [
                    "2023-05-30T22:51:42Z",
                    "2022-11-03T03:43:35Z",
                    "2023-05-31T06:24:16Z"
                ],
                "publicdate": "2022-11-03T03:43:35Z",
                "subject": [
                    "Odysee",
                    "88c88419f2991692cc754debaaae485f1cf2a6d9",
                    "NASA"
                ],
                "title": "Odysee - NASA (2022)",
                "week": 3,
                "year": 2022
            },
            {
                "btih": "48e59ee4b45facd28dc7de2162eea255748c86fc",
                "collection": [
                    "mirrortube",
                    "additional_collections"
                ],
                "creator": "NASA",
                "date": "2023-05-01T00:00:00Z",
                "description": "An archive of videos from the Odysee channel \"NASA\" from 202305. * channel_id: 88c88419f2991692cc754debaaae485f1cf2a6d9 * uploader: NASA",
                "downloads": 48,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JSON",
                    "Metadata",
                    "Unknown"
                ],
                "identifier": "odysee_-_nasa_202305",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 57694,
                "mediatype": "movies",
                "month": 7,
                "oai_updatedate": [
                    "2023-08-21T04:32:48Z",
                    "2023-07-19T09:57:51Z",
                    "2023-08-21T04:32:49Z"
                ],
                "publicdate": "2023-07-19T09:57:51Z",
                "subject": [
                    "Odysee",
                    "88c88419f2991692cc754debaaae485f1cf2a6d9",
                    "NASA"
                ],
                "title": "Odysee - NASA (202305)",
                "week": 4,
                "year": 2023
            },
            {
                "backup_location": "ia903605_9",
                "btih": "731c19cfb9467734554d171aea8292364f099cc3",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-carmen_dom_nguez"
                ],
                "creator": "NASA",
                "date": "2010-01-01T00:00:00Z",
                "description": "Learn how NASA graduate students are using biofeedback to improve concentration skills. The project is based on earlier NASA aeronautics research to improve the attentiveness of pilots in flight simulators and improve atheletes muscle memory.",
                "downloads": 850,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_Launchpad_Biofeedback_HD",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "NASA_Launchpad_Biofeedback_HD",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 510992428,
                "language": "EN",
                "mediatype": "movies",
                "month": 1,
                "oai_updatedate": [
                    "2010-04-19T22:01:07Z",
                    "2010-04-19T22:02:19Z",
                    "2010-04-19T22:02:40Z",
                    "2010-04-21T00:28:42Z",
                    "2010-04-21T00:32:41Z",
                    "2023-07-06T15:40:07Z"
                ],
                "publicdate": "2010-04-19T22:02:19Z",
                "subject": [
                    "eclips",
                    "nasa",
                    "biofeedback"
                ],
                "title": "NASA_Launchpad_Biofeedback_HD",
                "week": 0,
                "year": 2010
            },
            {
                "backup_location": "ia906200_5",
                "btih": "9bde4fde3eb48872e9304c6120e25287caee756f",
                "collection": [
                    "nasaaudiocollection",
                    "nasa",
                    "fav-archivebanker",
                    "fav-chris_hewer",
                    "fav-folbau",
                    "fav-hepup",
                    "fav-ledionst",
                    "fav-misbah_zahid",
                    "fav-roton_one"
                ],
                "creator": "NASA",
                "date": "1984-01-01T00:00:00Z",
                "description": "NASA Space Note #80",
                "downloads": 1419,
                "format": [
                    "Archive BitTorrent",
                    "Columbia Peaks",
                    "Flac",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "Ogg Vorbis",
                    "PNG",
                    "Spectrogram",
                    "VBR MP3",
                    "WAVE"
                ],
                "identifier": "NASASpaceNote80",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 724079890,
                "language": "eng",
                "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/",
                "mediatype": "audio",
                "month": 6,
                "oai_updatedate": [
                    "2016-06-08T18:56:03Z",
                    "2022-08-29T22:55:40Z"
                ],
                "publicdate": "2016-06-08T18:56:03Z",
                "subject": [
                    "NASA",
                    "Space Shuttle"
                ],
                "title": "NASA Space Note 80",
                "week": 4,
                "year": 1984
            },
            {
                "backup_location": "ia903602_12",
                "btih": "9c6e8481867d7d217c65bb2677099a01c5208b6b",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-sciencefictionfan2008",
                    "fav-lcat"
                ],
                "creator": "NASA",
                "date": "2008-01-01T00:00:00Z",
                "description": "This is not your typical NASA program. NASA 360 discovers how technologies developed for Space, Aeronautics and general applications can help people here on Earth.",
                "downloads": 117642,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_360_program1_HD",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "NASA_360_program1_HD",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 1838212996,
                "language": "eng",
                "mediatype": "movies",
                "month": 2,
                "oai_updatedate": [
                    "2008-09-09T17:06:27Z",
                    "2008-09-09T17:09:36Z",
                    "2008-09-09T17:11:07Z",
                    "2008-09-12T00:38:18Z",
                    "2009-01-23T16:32:19Z",
                    "2009-01-23T17:29:52Z",
                    "2010-04-13T21:00:21Z",
                    "2023-07-06T15:40:27Z"
                ],
                "publicdate": "2008-09-09T17:09:36Z",
                "subject": [
                    "technology",
                    "aeronautics",
                    "space",
                    "aviation",
                    "NASA research"
                ],
                "title": "NASA 360 Episode 1",
                "week": 1,
                "year": 2008
            },
            {
                "collection": [
                    "apkarchive",
                    "phonesoftware"
                ],
                "creator": "NASA",
                "description": "An apk for the official NASA app.",
                "downloads": 24,
                "format": [
                    "Android Package Archive",
                    "Archive BitTorrent",
                    "Metadata"
                ],
                "identifier": "nasa_20210818",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 23145432,
                "mediatype": "software",
                "month": 1,
                "oai_updatedate": [
                    "2021-08-18T11:46:54Z",
                    "2021-08-31T10:25:01Z"
                ],
                "publicdate": "2021-08-18T11:46:54Z",
                "subject": [
                    "NASA",
                    "app",
                    "apk"
                ],
                "title": "NASA App",
                "week": 1
            },
            {
                "collection": [
                    "social-media-video",
                    "additional_collections_video"
                ],
                "creator": "NASA",
                "date": "2023-06-01T00:00:00Z",
                "description": "An archive of videos from the Odysee channel \"NASA\" from 202306. * channel_id: 88c88419f2991692cc754debaaae485f1cf2a6d9 * uploader: NASA",
                "downloads": 15,
                "format": [
                    "Item Tile",
                    "JPEG",
                    "JSON",
                    "MPEG4",
                    "Matroska",
                    "Metadata",
                    "Unknown"
                ],
                "identifier": "odysee_-_nasa_202306",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 686811505,
                "mediatype": "movies",
                "month": 0,
                "oai_updatedate": [
                    "2023-06-09T05:42:00Z",
                    "2023-06-06T13:05:10Z",
                    "2023-07-19T09:33:01Z"
                ],
                "publicdate": "2023-06-06T13:05:10Z",
                "subject": [
                    "Odysee",
                    "NASA",
                    "88c88419f2991692cc754debaaae485f1cf2a6d9"
                ],
                "title": "Odysee - NASA (202306)",
                "week": 0,
                "year": 2023
            },
            {
                "avg_rating": 0,
                "backup_location": "ia903602_12",
                "btih": "540ed1c4f77dc5656bd1d1f10b3fc04b89b38a54",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-carmen_dom_nguez",
                    "fav-lcat",
                    "fav-sciencefictionfan2008"
                ],
                "creator": "NASA",
                "date": "2008-01-01T00:00:00Z",
                "description": "NASA 360 discovers how technologies developed for Space, Aeronautics and general applications can help people here on Earth. What has NASA done for you lately? Watch and find out!",
                "downloads": 114884,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_360_program2_HD",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "NASA_360_program2_HD",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 1720133577,
                "language": "eng",
                "mediatype": "movies",
                "month": 1,
                "num_reviews": 1,
                "oai_updatedate": [
                    "2008-09-10T19:41:32Z",
                    "2008-09-10T19:42:19Z",
                    "2008-09-10T19:42:25Z",
                    "2008-09-12T00:39:17Z",
                    "2009-01-23T16:34:35Z",
                    "2009-01-23T17:30:22Z",
                    "2009-10-14T18:08:29Z",
                    "2023-07-06T15:40:11Z",
                    "2008-11-18T09:11:14Z"
                ],
                "publicdate": "2008-09-10T19:42:19Z",
                "reviewdate": "2008-11-18T09:11:14Z",
                "subject": [
                    "aeronautics",
                    "technology",
                    "space",
                    "earth",
                    "NASA research"
                ],
                "title": "NASA 360 Episode 2",
                "week": 0,
                "year": 2008
            },
            {
                "backup_location": "ia906200_6",
                "collection": [
                    "nasaaudiocollection",
                    "nasa",
                    "fav-hepup",
                    "fav-mimotakito_111",
                    "fav-david_cash",
                    "fav-william871"
                ],
                "creator": "NASA",
                "date": "1984-01-01T00:00:00Z",
                "description": "NASA Space Note #80 Digitized by Kevin Savetz, savetz.com This cassette was recorded badly, staring midway in part 4 then wrapping around to part 1 after park 10. This is in file \"NASA Space Note 81 raw\". \"NASA Space Note 81 fixed\" is the version where I put things in the right order, but part 4 is missing a small section in the middle due to the initial mastering problem. \"NASA Space Note 81 fixed-cleaned-levelated\" is the best version. ",
                "downloads": 1703,
                "format": [
                    "Archive BitTorrent",
                    "Columbia Peaks",
                    "Flac",
                    "JPEG",
                    "JPEG Thumb",
                    "Metadata",
                    "Ogg Vorbis",
                    "PNG",
                    "Spectrogram",
                    "VBR MP3",
                    "WAVE"
                ],
                "identifier": "NASASpaceNote8",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 1001786606,
                "language": "eng",
                "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/",
                "mediatype": "audio",
                "month": 15,
                "oai_updatedate": [
                    "2016-06-08T20:14:25Z",
                    "2022-08-29T22:55:23Z"
                ],
                "publicdate": "2016-06-08T20:14:25Z",
                "subject": "NASA",
                "title": "NASA Space Note #81",
                "week": 6,
                "year": 1984
            },
            {
                "btih": "0353d559fe8b883e372d8ef0e869c1d44aed84e6",
                "collection": [
                    "social-media-video",
                    "additional_collections_video"
                ],
                "creator": "NASA",
                "date": "2022-10-01T00:00:00Z",
                "description": "An archive of videos from the Odysee channel \"NASA\" from 202210. * channel_id: 88c88419f2991692cc754debaaae485f1cf2a6d9 * uploader: NASA",
                "downloads": 56,
                "format": [
                    "Archive BitTorrent",
                    "Item Tile",
                    "JPEG",
                    "JSON",
                    "Matroska",
                    "Metadata",
                    "Unknown"
                ],
                "identifier": "odysee_-_nasa_202210",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 36209971,
                "mediatype": "movies",
                "month": 0,
                "oai_updatedate": [
                    "2023-06-09T05:42:02Z",
                    "2023-06-06T20:22:35Z",
                    "2023-07-19T09:55:39Z"
                ],
                "publicdate": "2023-06-06T20:22:35Z",
                "subject": [
                    "Odysee",
                    "NASA",
                    "88c88419f2991692cc754debaaae485f1cf2a6d9"
                ],
                "title": "Odysee - NASA (202210)",
                "week": 0,
                "year": 2022
            },
            {
                "backup_location": "ia903601_26",
                "btih": "517dea1692f32f494a92dc7a0733b7af6c4ed124",
                "collection": [
                    "opensource_movies",
                    "community",
                    "fav-lukethenerd"
                ],
                "creator": "moon-nasa",
                "description": "moon-nasa",
                "downloads": 1497,
                "format": [
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "Real Media",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "moon-nasa",
                "indexflag": [
                    "index",
                    "nonoindex",
                    "uncurated"
                ],
                "item_size": 25277394,
                "mediatype": "movies",
                "month": 0,
                "oai_updatedate": [
                    "2008-03-11T04:26:10Z",
                    "2008-03-11T04:27:20Z",
                    "2021-02-17T03:58:18Z"
                ],
                "publicdate": "2008-03-11T04:27:20Z",
                "subject": "moon-nasa",
                "title": "moon-nasa",
                "week": 0
            },
            {
                "backup_location": "ia903604_35",
                "btih": "c89fb9cdbd1cf98bfc20196550722b4749c57e52",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-william871"
                ],
                "creator": "NASA eClips",
                "description": "Learn how NASA engineers are paving the way to new aeronautical breakthroughs and helping to make the future of flying safer and greener.",
                "downloads": 20907,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_360_15_HD",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Flash Video",
                    "Item Tile",
                    "JPEG",
                    "JPEG Thumb",
                    "MPEG4",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "SubRip",
                    "Thumbnail",
                    "ZIP",
                    "h.264"
                ],
                "identifier": "NASA_360_15_HD",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 3497326814,
                "language": "english",
                "mediatype": "movies",
                "month": 2,
                "oai_updatedate": [
                    "2010-03-08T20:16:29Z",
                    "2010-03-08T20:26:14Z",
                    "2010-03-08T20:26:24Z",
                    "2010-03-08T20:26:39Z",
                    "2010-03-16T21:46:44Z",
                    "2010-03-22T19:44:57Z",
                    "2023-07-06T15:40:02Z"
                ],
                "publicdate": "2010-03-08T20:26:14Z",
                "subject": [
                    "NASA",
                    "eClips",
                    "NIA",
                    "BWB",
                    "x-48",
                    "flight tests"
                ],
                "title": "NASA 360: NASA and Future of AeronauticsNASA 360: NASA and Future of Aeronautics",
                "week": 2
            },
            {
                "backup_location": "ia906803_4",
                "collection": [
                    "opensource",
                    "community"
                ],
                "creator": "Stockist Nasa Gresik",
                "date": "2018-10-14T00:00:00Z",
                "description": "Stockist Nasa GRESIK adalah tempat bagi konsumen dan distributor produk Nasa untuk membeli produk produk Nasa. Stockist Nasa juga melayani pendaftaran member baru bagi anda yang ingin bergabung memasarkan produk NASA. Stockist Nasa merupakan kepanjangan tangan dari perusahaan PT. Natural Nusantara untuk menyalurkan semua produk Nasa, memberikan support kepada para distributor, melayani konsumen yang membutuhkan produk Nasa dan lain sebagainya. Untuk saat ini di Indonesia sudah banyak sekali terdapat Stockist Nasa yang tersebar dari Sabang sampai Merauke. Bahkan sudah ada beberapa member di Nasa yang sudah menembus pasar eksport ke luar negeri bahkan mendirikan Stockist disana. termasuk salah satunya berada di kawasn kota tercinta ini GRESIK. JIka didaerah anda mempunyai prospek yang sangat bagus untuk mendirikan Stockist Nasa, jangan ragu ragu untuk menghubungi saya karena PT. NASA saat ini masih membutuhkan banyak sekali Stokist untuk melayani seluruh Indonesia supaya kesediaan produk NASA bisa tercukupi. Untuk Anda yang sedang mencari semua produk dari PT NATURAL nusantara anda bisa menghubungi kami di : CALL / SMS  / WA : 081-334-266-842",
                "downloads": 21,
                "format": [
                    "Archive BitTorrent",
                    "Metadata",
                    "Word Document"
                ],
                "identifier": "StockistNasaGresik",
                "indexflag": [
                    "index",
                    "nonoindex",
                    "uncurated"
                ],
                "item_size": 911598,
                "language": "ind",
                "mediatype": "texts",
                "month": 0,
                "oai_updatedate": [
                    "2018-10-15T05:46:28Z",
                    "2021-02-19T03:01:54Z"
                ],
                "publicdate": "2018-10-15T05:46:28Z",
                "stripped_tags": [
                    "p dir=\"ltr\" style=\"line-height:1.44;margin-top:0pt;margin-bottom:8pt;background-color:#ffffff;\"",
                    "span style=\"font-size:9pt;font-family:Verdana;color:rgb(85,85,85);background-color:transparent;font-weight:700;vertical-align:baseline;\"",
                    "span style=\"font-size:9pt;font-family:Verdana;color:rgb(85,85,85);background-color:transparent;vertical-align:baseline;\""
                ],
                "subject": [
                    "nasa",
                    "stockist nasa",
                    "distributor nasa"
                ],
                "title": "Stockist Nasa Gresik",
                "week": 0,
                "year": 2018
            },
            {
                "backup_location": "ia906603_24",
                "collection": [
                    "booksbylanguage_indonesian",
                    "booksbylanguage",
                    "fav-lucke133"
                ],
                "creator": "Distributor Nasa Makassar",
                "date": "2017-12-21T00:00:00Z",
                "description": "Silahkan anda menghubungi nomor WA:0852.3085.6232, apabila anda mencari Distributor Agen Nasa Area Di Makassar Apakah anda bingung bagaimana meningkatkan hasil panen anda? Apakah anda ingin mempercepat pertumbuhan tanaman anda? Bagaimana caranya mempercepat pembuahan dan meningkatkan hasil panen secara kualitas dan kuantitas? Produk Pupuk Organik Cair (POC) merupakan produk unggulan dari PT. Natural Nusantara (NASA) yang menggunakan formula khusus untuk mencukupi kebutuhan nutrisi lengkap pada tanaman untuk mengembalikan kondisi tanah yang subur sehingga akan meningkatkan kualitas hasil panen tanaman anda. Akhirnya, anda tahu bagaimana cara yang efektif untuk untuk meningkatkan kualitas hasil panen tanaman anda. Sekarang anda bisa mendapatkan produk unggulan Nasa ini dengan sangat mudah karena banyaknya agen dan distributor yang tersebar di seluruh Indonesia, khususnya di kota Makassar. Distributor Agen Nasa Area Di Makassar, Distributor Pusat Nasa Area Di Makassar, Distributor Stockist Nasa Area Di Makassar, Alamat Distributor Nasa Area Di Makassar, Informasi Distributor Nasa Area Di Makassar, Dimana Distributor Nasa Area Di Makassar, Daftar Distributor Nasa Area Di Makassar, Kontak Distributor Nasa Area Di Makassar, Distributor Resmi Nasa Area Di Makassar, Distributor Legal Nasa Area Di Makassar, Distributor Agen Nasa Terpercaya Di Makassar, Distributor Agen Nasa Terlengkap Di Makassar, Distributor Agen Nasa Terdekat Di Makassar, Distributor Agen Nasa Termurah Di Makassar, Distributor Agen Nasa Terbesar Di Makassar, Distributor Agen Nasa Terkenal Di Makassar, Distributor Agen Nasa Berkualitas Di Makassar, Distributor Agen Nasa Terpercaya Di Makassar, Distributor Agen Nasa Terpercaya Di Makassar, Distributor Agen Nasa Terpercaya Di Makassar.   https://medium.com/@distributornasamakassar1/wa-0852-3085-6232-distributor-agen-nasa-area-di-makassar-1f9fa32b9802",
                "downloads": 83,
                "format": [
                    "Abbyy GZ",
                    "Additional Text PDF",
                    "Archive BitTorrent",
                    "DjVuTXT",
                    "Djvu XML",
                    "Image Container PDF",
                    "Item Tile",
                    "Metadata",
                    "Scandata",
                    "Single Page Processed JP2 ZIP"
                ],
                "identifier": "AgenNasaMakassar1",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 835025,
                "language": "ind",
                "mediatype": "texts",
                "month": 1,
                "oai_updatedate": [
                    "2017-12-21T02:28:24Z",
                    "2023-04-14T20:37:02Z"
                ],
                "publicdate": "2017-12-21T02:28:24Z",
                "subject": [
                    "Distributor Nasa Makassar",
                    "Distributor Nasa Di Makassar",
                    "Distributor Nasa Area Makassar",
                    "Distributor Produk Nasa Makassar"
                ],
                "title": "Agen Nasa Makassar ( 1)",
                "week": 0,
                "year": 2017
            },
            {
                "avg_rating": 4,
                "backup_location": "ia903602_23",
                "btih": "e878c6999081f337bc42f76b1b3d13feabeae9ff",
                "collection": [
                    "nasa",
                    "nasaeclips",
                    "fav-lcat",
                    "fav-lshimokaji",
                    "fav-pandiyan_innova",
                    "fav-william871"
                ],
                "creator": "NASA",
                "description": "This episode of NASA 360 looks at how NASA tests the equipment needed for our return to the moon. Highlights include: the lunar truck Chariot, NASA's All Terrain Hex-Limbed Extra-Terrestrial Explorer, or ATHLETE, the rover Scarab and new suits for astronauts.",
                "downloads": 97151,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:NASA_360_program6_HD",
                "format": [
                    "512Kb MPEG4",
                    "Animated GIF",
                    "Archive BitTorrent",
                    "Item Tile",
                    "Metadata",
                    "Ogg Video",
                    "QuickTime",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "Thumbnail",
                    "h.264"
                ],
                "identifier": "NASA_360_program6_HD",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 1710270941,
                "mediatype": "movies",
                "month": 1,
                "num_reviews": 1,
                "oai_updatedate": [
                    "2009-01-09T18:11:38Z",
                    "2009-01-09T18:14:23Z",
                    "2009-01-09T18:14:32Z",
                    "2009-01-23T16:49:09Z",
                    "2009-01-23T17:32:53Z",
                    "2023-07-06T15:40:12Z",
                    "2023-06-01T14:17:13Z"
                ],
                "publicdate": "2009-01-09T18:14:23Z",
                "reviewdate": "2023-06-01T14:17:13Z",
                "subject": [
                    "NASA",
                    "episode",
                    "Chariot",
                    "ATHLETE",
                    "rovers",
                    "spacesuits",
                    "Scarab",
                    "cooling",
                    "testing",
                    "Moses Lake"
                ],
                "title": "NASA 360 Episode 6",
                "week": 1
            },
            {
                "backup_location": "ia903603_26",
                "btih": "bb09a21f9b124aadd0ad6373bf7bb87a46686005",
                "collection": [
                    "nasa",
                    "nasacastvideo"
                ],
                "creator": "NASA",
                "date": "2009-03-13T00:00:00Z",
                "description": "NASA TV's This Week @NASA, March 13",
                "downloads": 239,
                "external-identifier": "urn:storj:bucket:jvrrslrv7u4ubxymktudgzt3hnpq:RSS_318840main_TWAN_03_15_09",
                "format": [
                    "Archive BitTorrent",
                    "Columbia Peaks",
                    "Item Tile",
                    "Metadata",
                    "Ogg Vorbis",
                    "PNG",
                    "Spectrogram",
                    "Storj Upload Log",
                    "Storj Upload Trigger",
                    "VBR MP3"
                ],
                "identifier": "RSS_318840main_TWAN_03_15_09",
                "indexflag": [
                    "index",
                    "nonoindex"
                ],
                "item_size": 13113846,
                "language": "en-us",
                "mediatype": "movies",
                "month": 1,
                "oai_updatedate": [
                    "2009-08-19T19:59:12Z",
                    "2009-08-19T20:01:19Z",
                    "2009-08-19T19:21:45Z",
                    "2023-07-06T15:42:36Z"
                ],
                "publicdate": "2009-08-19T20:01:19Z",
                "rights": "Public Domain",
                "source": "http://www.nasa.gov/multimedia/podcasting/twan_03_13_09.html",
                "subject": "This Week @NASA: A weekly summary of the latest news, events and mission activities at NASA.",
                "title": "NASA TV's This Week @NASA, March 13",
                "week": 0,
                "year": 2009
            }
        ]
    }
};