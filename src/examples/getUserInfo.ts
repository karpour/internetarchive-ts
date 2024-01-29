import { readFileSync } from "fs";
import { getUserInfo } from "../api";
import { IaApiError } from "../error";
import { IaSessionParams } from "../types";

const credentials = JSON.parse(readFileSync(".env.json") as any) as IaSessionParams;

console.log(credentials);

getUserInfo(credentials.accessKey, credentials.secretKey)
    .then(i => console.log(i))
    .catch(err => {
        console.error(err.message);
        if (err instanceof IaApiError) {
            err.response?.text().then(j => console.log(j));
        }
    });