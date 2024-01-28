import { ReadStream } from "fs";

/**
 * From https://github.com/MattMorgis/async-stream-generator
 */
async function* nodeStreamToIterator(stream: ReadStream) {
    for await (const chunk of stream) {
        yield chunk;
    }
}
/**
 * Taken from Next.js doc
 * https://nextjs.org/docs/app/building-your-application/routing/router-handlers#streaming
 * Itself taken from mozilla doc
 * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
 * @param {*} iterator 
 * @returns {ReadableStream}
 */
function iteratorToStream(iterator:AsyncIterator<any>):ReadableStream {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next();

            if (done) {
                controller.close();
            } else {

                controller.enqueue(new Uint8Array(value));
            }
        },
    });
}


export function readStreamToReadableStream(stream: ReadStream):ReadableStream {
    return iteratorToStream(nodeStreamToIterator(stream))
}
