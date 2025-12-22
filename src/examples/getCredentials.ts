import { readFileSync } from "fs";
import { IaSessionParams } from "../types/index.js";

export const CREDENTIALS_PATH = "ia.json";
export function getCredentials(): IaSessionParams {
    try {
        return JSON.parse(readFileSync(CREDENTIALS_PATH) as any) as IaSessionParams;
    } catch (err) {
        console.error(`Credentials not found or invalid: ${(err as any).message}`);
        console.error(`Please place a file with the credentials at "${CREDENTIALS_PATH}" with the contents:`);
        console.error(`{\n  "accessKey": "<your_access_key>",\n  "secretKey": "<your_secret_key>"\n}`);
        console.error(`You can retrieve your keys at: https://archive.org/account/s3.php`);
        process.exit(1);
    }
}
