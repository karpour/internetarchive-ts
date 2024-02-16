/**
 * Create a generator that yields file chunks of a speficic size
 * @param fp 
 * @param chunkSize 
 */
export function* chunkGenerator(fp: any, chunkSize: number): Generator<Buffer> {
    let chunk: Buffer | undefined;
    while (chunk = fp.read(chunkSize)) {
        yield chunk;
    }
}