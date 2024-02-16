import { readFileSync } from "fs";
import { getSession } from "../api";
import { IaSessionParams, IaAuthConfig } from "../types";

const credentials = JSON.parse(readFileSync(".env.json") as any) as IaSessionParams;

async function main() {
    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const s = getSession(config);

    const identifier = process.argv[2] ?? 'nasa';

    console.log(`Task history for ${identifier}`);
    for await (const task of s.iterTaskHistory(identifier)) {
        console.log(`${task.task_id}`.padEnd(12) + task.cmd.padEnd(20) + task.submittime.padEnd(26) + " " + task.submitter);
    }
}


main().catch((err) => console.log(err));