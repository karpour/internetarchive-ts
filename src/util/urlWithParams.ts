
/**
 * Creates a url with get parameters
 * @param url URL
 * @param params Record of params to add
 * @returns url with params added
 */
export function urlWithParams(url: string, params: Record<string, string | string[] | number | boolean | Date | undefined> = {}): string {
    const urlObj = new URL(url);
    for (const [key, value] of Object.entries(params)) {
        urlObj.searchParams.set(key, (value !== undefined && value !== null) && `${value}` || "");
    }
    return urlObj.href;
}

export default urlWithParams;