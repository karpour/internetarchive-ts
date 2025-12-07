import { readFileSync } from "fs";
import { getSession } from "../api/index.js";
import { IaSessionParams, IaAuthConfig } from "../types/index.js";

const credentials = JSON.parse(readFileSync(".env.json") as any) as IaSessionParams;

async function main() {
    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const s = getSession(config);

    const identifier = process.argv[2] ?? 'nasa';

    console.log(`Catalog tasks for ${identifier}`);
    for await (const task of s.iterCatalogTasks(identifier)) {
        console.log(`${task.task_id}`.padEnd(12) + task.cmd.padEnd(20) + task.submittime.padEnd(26) + " " + task.submitter);
    }
}


main().catch((err) => console.log(err));