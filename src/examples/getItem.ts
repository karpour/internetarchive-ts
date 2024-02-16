import { getItem } from "../api";

async function main() {
    const identifier = process.argv[2] ?? 'nasa';

    const item = await getItem(identifier);
    
    console.log(`Identifier: ${item.identifier}`);
    console.log(`Item size: ${item.item_size}`);
    console.log(`Date: ${item.created}`);
}

main();