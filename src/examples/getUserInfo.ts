import { getSession } from "../api";
import { IaApiAuthenticationError } from "../error";
import { IaAuthConfig } from "../types";
import { getCredentials } from "./getCredentials";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { s3: { access: credentials.accessKey, secret: credentials.secretKey } };
    const session = getSession(config);

    try {
        const userInfo = await session.getUserInfo();
        console.log(userInfo);
    } catch (err) {
        if (err instanceof IaApiAuthenticationError) {
            console.error(`Authentication Error: ${err.message}`);
        } else {
            throw err;
        }
    }
}

main().catch((err) => console.log(err));