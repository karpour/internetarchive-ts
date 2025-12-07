import { getAnnouncements, getMediaCounts, getTopCollections } from "../api/index.js";

async function main() {
    try {
        const announcements = await getAnnouncements();
        console.log(`Announcements:`);
        for (const { title, link } of announcements) {
            console.log(`${title} - ${link}`);
        }

        const mediacounts = await getMediaCounts();
        console.log(`\nMedia counts:`);
        for (const [mediaType, count] of Object.entries(mediacounts)) {
            console.log(`${mediaType}: ${count}`);
        }

        const topCollections = await getTopCollections(10);
        console.log(`\nTop collections:`);
        for (const { title, item_count } of topCollections) {
            console.log(`${title} (${item_count})`);
        }
    } catch (err) {
        console.error(err);
    }
}

main();