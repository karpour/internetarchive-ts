
/**
 * Generate Array from async iterator.
 * This method can be replaced with Array.fromAsync in the future.
 * @param generator Async generator
 * @returns Array containing all items that the async generator yields
 */
// TODO replace with Array.fromAsync
export async function arrayFromAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
    const arr = [];
    for await (const i of generator) arr.push(i);
    return arr;
}