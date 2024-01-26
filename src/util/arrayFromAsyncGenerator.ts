export async function arrayFromAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
    const arr = [];
    for await (const i of generator) arr.push(i);
    return arr;
}