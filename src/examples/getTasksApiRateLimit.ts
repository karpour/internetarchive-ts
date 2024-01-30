import { readFileSync } from "fs";
import { getSession } from "../api";
import { IaSessionParams, IaAuthConfig, IA_TASK_TYPES } from "../types";

const credentials = JSON.parse(readFileSync(".env.json") as any) as IaSessionParams;

async function main() {
    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const s = getSession(config);

    for (const taskType of IA_TASK_TYPES) {
        console.log(`Rate limits for ${taskType}:`);
        const limits = await s.getTasksApiRateLimit(taskType);
        console.log(limits);
    }
}


main().catch((err) => console.log(err));