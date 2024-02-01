import { readFileSync } from "fs";
import { getItem, getSession } from "../api";
import { IaSessionParams, IaAuthConfig } from "../types";

const credentials = JSON.parse(readFileSync(".env.json") as any) as IaSessionParams;

async function main() {
    const config: IaAuthConfig = { 's3': { 'access': credentials.accessKey, 'secret': credentials.secretKey } };
    const session = getSession(config);

    const identifier = process.argv[2] ?? 'nasa';

    const item = await session.getItem(identifier);
    const review = await item.getReview();
    console.log(review);
}


main().catch((err) => console.log(err));