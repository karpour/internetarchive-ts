import { Writable } from "stream";

/**
 * Write the output of a {@link ReadableStream} to a {@link Writeable}
 * Used by {@link IaFile.download}
 * @param stream input stream
 * @param writable output stream
 */
export async function writeReadableStreamToWritable(stream: ReadableStream, writable: Writable & { flush?: Function; }): Promise<void> {
    let reader = stream.getReader();
    try {
        while (true) {
            let { done, value } = await reader.read();

            if (done) {
                writable.end();
                break;
            }

            writable.write(value);
            writable.flush?.();
        }
    } catch (error: unknown) {
        writable.destroy(error as Error);
        throw error;
    }
}
