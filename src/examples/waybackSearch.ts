import dateToYYYYMMDD from "../util/dateToYYYYMMDD.js";
import { parseWaybackTimestamp } from "../util/parseWaybackTimestamp.js";
import WaybackMachine from "../wayback/WaybackMachine.js";

async function main() {
    const wbm = new WaybackMachine();

    const query = process.argv[2] ?? 'http://www.archive.org';

    const matches = await wbm.getSnapshotMatches(query, {
        limit: 100, // Limit to 100 results
        collapse: "timestamp:6", // Limit to one result per month
        fl: ["original", "statuscode", "timestamp"] // Specify which fields to return
    });

    

    matches.forEach(m => {
        console.log(`${dateToYYYYMMDD(parseWaybackTimestamp(m.timestamp))} ${m.statuscode} ${m.original}`);
    });
}

main();