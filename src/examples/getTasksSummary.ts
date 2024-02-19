import { getSession } from "../api";
import { IaAuthConfig } from "../types";
import { IaApiItemNotFoundError } from "../error";
import { getCredentials } from "./getCredentials";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { s3: { access: credentials.accessKey, secret: credentials.secretKey } };
    const session = getSession(config);

    const identifier = process.argv[2] ?? 'nasa';

    try {
        const item = await session.getItem(identifier);

        const tasks = await item.getTasksSummary();
        console.log(tasks);
        if (await item.hasTasksPending()) {
            console.log(`Item "${identifier}" has tasks pending`);
        } else {
            console.log(`Item "${identifier}" has no tasks pending`);
        }
    } catch (err) {
        if (err instanceof IaApiItemNotFoundError) {
            console.error(`Item "${identifier}" not found`);
        }
        throw err;
    }
}

main().catch((err) => console.error(`Error: ${err.message}`));