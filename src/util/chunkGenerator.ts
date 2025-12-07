
/**
 * Creates a generator that yields file chunks of a specific size
 * @param fp 
 * @param chunkSize 
 */
//export function* chunkGenerator(fp: TODO, chunkSize: number): Generator<Buffer> {
//    let chunk: Buffer | undefined;
//    while (chunk = fp.read(chunkSize)) {
//        yield chunk;
//    }
//}

export async function* chunkGeneratorNodeStream(fp: NodeJS.ReadableStream, chunkSize: number): AsyncGenerator<Buffer> {
    for await (const chunk of fp) {
        // Node sometimes gives smaller/larger chunks, so we re-chunk manually
        let buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        while (buf.length) {
            yield buf.slice(0, chunkSize);
            buf = buf.slice(chunkSize);
        }
    }
}


export async function* chunkGeneratorBlob(
    fp: Blob,
    chunkSize: number
): AsyncGenerator<Buffer> {
    let offset = 0;
    while (offset < fp.size) {
        const slice = fp.slice(offset, offset + chunkSize);
        const ab = await slice.arrayBuffer();
        yield Buffer.from(ab);
        offset += chunkSize;
    }
}


export async function* chunkGeneratorWebStream(
    fp: ReadableStream<Uint8Array>,
    chunkSize: number
): AsyncGenerator<Buffer> {
    const reader = fp.getReader();
    let leftover = Buffer.alloc(0);

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        let chunk = Buffer.from(value);
        leftover = Buffer.concat([leftover, chunk]);

        while (leftover.length >= chunkSize) {
            yield leftover.slice(0, chunkSize);
            leftover = leftover.slice(chunkSize);
        }
    }

    if (leftover.length > 0) {
        yield leftover;
    }
}



export function chunkGenerator(
    fp: NodeJS.ReadableStream | Blob | ReadableStream<Uint8Array>,
    chunkSize: number
): AsyncGenerator<Buffer> {
    if (fp instanceof Blob) {
        return chunkGeneratorBlob(fp, chunkSize);
    }

    if (fp instanceof ReadableStream) {
        return chunkGeneratorWebStream(fp, chunkSize);
    }

    if ("read" in fp && typeof fp.read === "function") {
        return chunkGeneratorNodeStream(fp, chunkSize);
    }

    throw new TypeError("Unsupported fp type");
}