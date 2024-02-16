import { getSession } from "../api";
import { IaAggregatableField, IaAuthConfig } from "../types";
import { getCredentials } from "../examples/getCredentials";
import { IaAdvancedSearch } from "../search/IaAdvancedSearch";
import sleepMs from "../util/sleepMs";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const query = process.argv[2] ?? 'computer chronicles';
    const aggs:IaAggregatableField[] = [
        'year'
    ];

    const search = new IaAdvancedSearch(session, query);
    for (const agg of aggs) {
        try {
            const result = await search.getAggregations([agg]);
            if (result[agg]) {
                const a = result[agg];
                //console.log(`${agg}: ${Object.values(result[agg].buckets).length}`);
            } else {
                console.error(`ERROR ${agg}: no value`);
            }
        } catch (err) {
            console.error(`ERROR ${agg}: [${(err as any).constructor.name}] ${(err as any).message}`);
            //console.log(err);
            //console.log(JSON.stringify((err as any).responseBody, null, 4));
        }
        await sleepMs(10000);
    }
}

main().catch((err) => console.log(err));