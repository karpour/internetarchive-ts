import dateToYYYYMMDD from "../util/dateToYYYYMMDD";
import { parseWaybackTimestamp } from "../util/parseWaybackTimestamp";
import { getSnapshotMatches } from "../wayback";

async function main() {
    const query = process.argv[2] ?? 'http://www.archive.org';

    const matches = await getSnapshotMatches(query, {
        limit: 100, // Limit to 100 results
        collapse: "timestamp:6", // Limit to one result per month
        fl: ["original", "statuscode", "timestamp"] // Specify which fields to return
    });

    

    matches.forEach(m => {
        console.log(`${dateToYYYYMMDD(parseWaybackTimestamp(m.timestamp))} ${m.statuscode} ${m.original}`);
    });
}

main();