import { getItem } from "../api";

async function main() {
    const item = await getItem('nasa');
    console.log(`Item size: ${item.item_size}`);
}

main();