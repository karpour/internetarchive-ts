import { getSession } from "../api";
import { IaAuthConfig } from "../types";
import { IaApiItemNotFoundError, IaApiUnauthorizedError } from "../error";
import { getCredentials } from "./getCredentials";
import { IaAdvancedSearch } from "../search/IaAdvancedSearch";
import { IaFullTextSearch } from "../search/IaFullTextSearch";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const query = process.argv[2] ?? '(uploader:jake@archive.org)';

    const search = new IaFullTextSearch(session, query);

    console.log(`Results: ${await search.getNumFound()}`)
    for await (const result of search.getResultsGenerator()) {
        console.log(result);
    }
}

main().catch((err) => console.log(err));