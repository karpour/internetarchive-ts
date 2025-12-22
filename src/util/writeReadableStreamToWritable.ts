import { Writable } from "stream";

/**
 * Write the output of a {@link ReadableStream} to a {@link Writeable}
 * Used by {@link IaFile.download}
 * @param stream input stream
 * @param writable output stream
 */
export async function writeReadableStreamToWritable(stream: ReadableStream, writable: Writable & { flush?: Function; }): Promise<void> {
    let reader = stream.getReader();
    let downloaded = 0;
    try {
        while (true) {
            let { done, value } = await reader.read();

            if (done) {
                writable.end();
                break;
            }

            downloaded += value.byteLength;
            //console.log(`${Math.round(downloaded/1024)/1024}MB`);

            writable.write(value);

        }
    } catch (error: unknown) {
        writable.destroy(error as Error);
        throw error;
    }
}
