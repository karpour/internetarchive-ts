import { Writable } from "stream";

/**
 * Write the output of a {@link ReadableStream} to a {@link Writeable}
 * Used by {@link IaFile.download}
 * @param stream input stream
 * @param writable output stream
 */
export async function writeReadableStreamToWritable(
    stream: ReadableStream,
    writable: Writable): Promise<void> {
    let reader = stream.getReader();
    let flushable = writable as { flush?: Function; };

    try {
        while (true) {
            let { done, value } = await reader.read();

            if (done) {
                writable.end();
                break;
            }

            writable.write(value);
            if (typeof flushable.flush === "function") {
                flushable.flush();
            }
        }
    } catch (error: unknown) {
        writable.destroy(error as Error);
        throw error;
    }
}
