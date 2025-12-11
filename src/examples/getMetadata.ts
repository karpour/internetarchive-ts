import { getSession } from "../api/index.js";
import { IaAuthConfig } from "../types/index.js";
import { IaApiItemNotFoundError } from "../error/index.js";
import { getCredentials } from "./getCredentials.js";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const identifier = process.argv[2] ?? 'nasa';

    try {
        const metadata = await session.getMetadata(identifier);
        console.log(metadata);
    } catch (err) {
        if (err instanceof IaApiItemNotFoundError) {
            console.error(`Item "${identifier}" not found`);
        } else {
            console.error(err);
        }
    }
}


main().catch((err) => console.log(err));