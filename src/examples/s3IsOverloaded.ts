import { getSession } from "../api/index.js";

async function main() {
    const session = getSession();

    const s3IsOverloaded = await session.s3IsOverloaded();

    console.log(s3IsOverloaded ? `S3 is overloaded` : `S3 is doing fine`);
}

main();