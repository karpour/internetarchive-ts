import { getAuthConfig } from "../session/getAuthConfig";

// Usage node getAuthConfig.js <username> <password>
async function main() {
    /** Credentials read from "./.env.json" */
    const authConfig = await getAuthConfig(process.argv[2]!, process.argv[3]!);

    console.log(authConfig);
}

main().catch((err) => console.log(err));