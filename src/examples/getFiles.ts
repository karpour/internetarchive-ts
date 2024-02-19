import { getFiles, getItem } from "../api";

async function main() {
    const identifier = process.argv[2] ?? 'nasa';

    const files = await getFiles(identifier);
    
    console.log(`Files for item ${identifier}`)
    for (const file of files) {
        console.log(file.name);
    }
}

main();