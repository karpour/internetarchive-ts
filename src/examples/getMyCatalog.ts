import { getSession } from "../api";
import { IaAuthConfig } from "../types";
import { IaApiItemNotFoundError } from "../error";
import { getCredentials } from "./getCredentials";

async function main() {
    /** Credentials read from "./.env.json" */
    const credentials = getCredentials();

    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const identifier = process.argv[2] ?? 'nasa';

    try {
        const tasks = await session.getMyCatalog({ identifier, history: 0, catalog: 0});
        console.log(tasks);
    } catch (err) {
        if (err instanceof IaApiItemNotFoundError) {
            console.error(`Item "${identifier} not found`);
        } else {
            console.error(err);
        }
    }
}

const a = {
    category: "history",
    identifier: "nasa",
    task_id: 31643502,
    server: "ia311234.us.archive.org",
    cmd: "create.php",
    args: {
        origcmd: "create",
        tester: "tracey",
        dir: "/0/items/nasa"
    },
    submittime: "2008-09-10 18:03:04",
    submitter: "tracey@archive.org",
    priority: 0,
    finished: 31194081
};


main().catch((err) => console.log(err));