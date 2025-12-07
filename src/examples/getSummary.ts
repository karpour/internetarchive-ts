import { getSession } from "../api/index.js";
import { IaAuthConfig } from "../types/index.js";
import { IaApiItemNotFoundError } from "../error/index.js";
import { getCredentials } from "./getCredentials.js";
import IaCatalog from "../catalog/IaCatalog.js";
import { setEngine } from "crypto";

const USAGE = "Usage: node getSummary.js <identifier>";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const identifier = process.argv[2];
    if (identifier == undefined) {
        console.log(USAGE);
        process.exit(1);
    }

    try {
        const catalog = new IaCatalog(session);
        const summary = await catalog.getSummary(identifier);
        console.log(summary);
    } catch (err) {
        if (err instanceof IaApiItemNotFoundError) {
            console.error(`Item "${identifier} not found`);
        } else {
            console.error(err);
        }
    }
}


main().catch((err) => console.log(err));