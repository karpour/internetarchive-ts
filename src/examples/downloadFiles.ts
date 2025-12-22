/**
 * This example program downloads all episodes of Computer Chronicles
 */


import path from "path";
import { IaSession } from "../session/index.js";

async function main() {
    const session = new IaSession();
    /** Search for all items in the `computerchronicles` collection, sorted by date added */
    const search = session.searchAdvanced("collection:computerchronicles", { sorts: ["addeddate asc"] });
    console.log(`Found ${await search.getNumFound()} items.`);

    // Iterate through the search results
    for await (const item of search.getItemsGenerator()) {
        console.log(item.itemData.metadata.title);

        /** Filter out all MPEG2 and MPEG4 files, prefer MPEG2 files */
        const videoFiles = [
            ...item.getFiles({ formats: ["MPEG2"] }),
            ...item.getFiles({ formats: ["MPEG4"] })
        ];
        
        /** Pick the first video file */
        const videoFile = videoFiles[0];
        if (videoFile) {
            /** Set file name to identifier name */
            const fileName = item.identifier + path.extname(videoFile.name);
            const target = path.join("test", fileName);
            console.log(`Downloading file "${videoFile.name}" to "${target}"`);
            // Download video file
            await videoFile.download({
                target
            });
        } else {
            console.error(`No video file found for item ${item.urls.details}`);
        }
    }
}

main().catch((err) => console.log(err));