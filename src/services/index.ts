import {
    IaAnnouncementItem,
    IaApiJsonResult,
    IaMediacounts,
    IaTopCollectionInfo
} from "../types";
import { handleIaApiError } from "../util";

// TODO use session fetch

type IaAnnouncementsResponse = IaApiJsonResult<{ posts: IaAnnouncementItem[]; }>;

/**
 * Get latest announcements from the archive.org blog (usually 3)
 * @returns Array of announcement items
*/
export async function getAnnouncements(): Promise<IaAnnouncementItem[]> {
    const response = await fetch(`https://archive.org/services/offshoot/home-page/announcements.php`);
    const responseBody = await response.json() as unknown as IaAnnouncementsResponse;
    if (!response.ok || !responseBody.success) {
        throw handleIaApiError({ response, responseBody });
    }
    return responseBody.value.posts;
}

type IaMediacountsResponse = IaApiJsonResult<{ counts: IaMediacounts; }>;

/**
 * Get media counts for all item categories except account
 * @returns Object containing category name as keys, and counts as values
*/
export async function getMediacounts(): Promise<IaMediacounts> {
    const response = await fetch(`https://archive.org/services/offshoot/home-page/mediacounts.php`);
    const responseBody = await response.json() as unknown as IaMediacountsResponse;
    if (!response.ok || !responseBody.success) {
        throw handleIaApiError({ response, responseBody });
    }
    return responseBody.value.counts;
}

type IaTopCollectionsResponse = IaApiJsonResult<{ docs: IaTopCollectionInfo[]; }>;

/**
 * Get top collections from the `collections` endpoint of the home page API
 * @param count number of top collections to return
 * @param page Page number
 * @returns Array of up to `count` items of collection info
 */
export async function getTopCollections(count: number = 50, page: number = 1): Promise<IaTopCollectionInfo[]> {
    const response = await fetch(`https://archive.org/services/offshoot/home-page/collections.php?${new URLSearchParams({ page: `${page}`, count: `${count}` }).toString()}`);
    const responseBody = await response.json() as unknown as IaTopCollectionsResponse;
    if (!response.ok || !responseBody.success) {
        throw handleIaApiError({ response, responseBody });
    }
    return responseBody.value.docs;
}