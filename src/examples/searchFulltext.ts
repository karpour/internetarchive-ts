import { getSession } from "../api/index.js";
import { IaAuthConfig } from "../types/index.js";
import { IaApiItemNotFoundError, IaApiUnauthorizedError } from "../error/index.js";
import { getCredentials } from "./getCredentials.js";
import { IaAdvancedSearch } from "../search/IaAdvancedSearch.js";
import { IaFullTextSearch } from "../search/IaFullTextSearch.js";
import { stripSingle } from "../util/stripSingle.js";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const query = process.argv[2] ?? 'computer chronicles';

    const search = new IaFullTextSearch(session, query, { dslFts: true });

    console.log(`Results: ${await search.getNumFound()}`);

    const aggregations = await search.getAggregations();
    console.log("Aggregations 'top-year': ");
    for (const agg of aggregations['top-year'].buckets) {
        console.log(`${agg.key}: ${agg.doc_count}`);
    }
    return;
    for await (const result of search.getResultsGenerator()) {
        console.log(stripSingle(result.fields.identifier));
    }
}

main().catch((err) => console.log(err));