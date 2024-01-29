import { isIdentifierAvailable } from '../api';

async function main() {
    const identifier = process.argv[2] ?? 'nasa';
    const available = await isIdentifierAvailable(identifier);
    console.log(`Identifier "${identifier}" available: ${available}`);
}

main();