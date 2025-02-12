import { getAnnouncements, getMediacounts, getTopCollections } from "../services";

async function main() {
    try {
        const announcements = await getAnnouncements();
        console.log(`Announcements:`);
        announcements.forEach(a => {
            console.log(`${a.title} - ${a.link}`);
        });

        const mediacounts = await getMediacounts();
        console.log(`\nMedia counts:`);
        for (let entry of Object.entries(mediacounts)) {
            console.log(`${entry[0]}: ${entry[1]}`);
        }

        const topCollections = await getTopCollections(10);
        console.log(`\nTop collections:`);
        for (let entry of topCollections) {
            console.log(`${entry.title} (${entry.item_count})`);
        }
    } catch (err) {
        console.log(err);
    }
}

main();

main();