import { getSession } from "../api/index.js";
import { IaAuthConfig } from "../types/index.js";
import { getCredentials } from "./getCredentials.js";
import { IaSearch } from "../search/IaSearch.js";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const query = process.argv[2] ?? 'computer chronicles';
    // Create a new IaSearch object, this uses the basic scrape API
    const search = new IaSearch(session,
        query,
        {
            // The fields to be returned for each result item.
            // Only some fields are guaranteed to be included, most will be typed as optional
            fields: ['collection', 'mediatype', 'date'],
            // We can supply up to 3 sort options
            sorts: ["year desc"],
            // Limit results to 33
            limit: 33
        });

    // Print number of reaults for this search
    console.log(`Total Results: ${await search.getNumFound()}`);

    // Iterate over the AsyncIterator that yields results
    for await (const result of search.getResultsGenerator()) {
        console.log(`${result.date} ${result.identifier} (${result.mediatype})`);
    }
}

main().catch((err) => console.log(err));