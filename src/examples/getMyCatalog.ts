import { getSession } from "../api/index.js";
import { IaAuthConfig } from "../types/index.js";
import { IaApiItemNotFoundError } from "../error/index.js";
import { getCredentials } from "./getCredentials.js";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const tasks = await session.getMyCatalogTasks();
    console.log(tasks);
}

main().catch((err) => console.log(err));