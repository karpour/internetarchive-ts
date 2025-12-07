import { getSession } from "../api/index.js";
import { IaAuthConfig } from "../types/index.js";
import { IaApiItemNotFoundError, IaApiUnauthorizedError } from "../error/index.js";
import { getCredentials } from "./getCredentials.js";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const task_id = parseInt(process.argv[2] ?? '10332');

    try {
        const taskLog = await session.getTaskLog(task_id);
        console.log(taskLog);
    } catch (err) {
        if (err instanceof IaApiItemNotFoundError) {
            console.error(`Item "${task_id} not found`);
        } else if (err instanceof IaApiUnauthorizedError) {
            console.error(err.message);
        } else {
            console.error(err);
        }
    }
}

main().catch((err) => console.log(err));