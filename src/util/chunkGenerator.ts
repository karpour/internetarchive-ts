import { TODO } from "../todotype";

/**
 * Creates a generator that yields file chunks of a speficic size
 * @param fp 
 * @param chunkSize 
 */
export function* chunkGenerator(fp: TODO, chunkSize: number): Generator<Buffer> {
    let chunk: Buffer | undefined;
    while (chunk = fp.read(chunkSize)) {
        yield chunk;
    }
}