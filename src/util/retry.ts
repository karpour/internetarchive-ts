import log from "../log/index.js";
import { sleepMs } from "./index.js";

/**
 * Retries an async function up to a specified a number of times
 * @param func Function to retry
 * @param maxRetries Maximum number of retries
 * @param cooldown optional cooldown between retries in ms
 * @returns result of the function if the original try or any of the retries succeeds
 * @throws {@link Error} Error of the last failed function call, if none of the retries is successful 
 */
export async function retry<T>(func: () => Promise<T>, maxRetries: number, cooldown: number = 0): Promise<T> {
    let attempts: number = 0;
    do {
        try {
            return await func();
        } catch (err) {
            //log.error(err as any);
            log.warning(`Failed to execute function, retrying (${attempts}/${maxRetries})`);
            if (++attempts > maxRetries) throw err;
        }
        if (cooldown) {
            await sleepMs(cooldown);
        }
    } while (true);
}

export default retry;