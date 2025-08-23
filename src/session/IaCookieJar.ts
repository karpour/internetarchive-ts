import { makeArray } from "../util";

export default class IaCookieJar {
    protected cookies: Record<string, string> = {};

    // Parse and store cookies from a Set-Cookie header array
    public addCookies(setCookieHeaders: string | string[]) {
        setCookieHeaders = makeArray(setCookieHeaders);

        for (const header of setCookieHeaders) {
            const [cookiePart] = header.split(';'); // Only use the key=value part
            if (cookiePart) {
                const [name, value] = cookiePart.split('=');
                if (name && value) {
                    this.setCookie(name.trim(), value.trim());

                }
            }
        }
    }

    public setCookie(key: string, value?: string): void {
        if (value) {
            this.cookies[key.trim()] = value.trim();
        }
    }

    // Return a cookie string for use in a Cookie header
    public getCookieHeader() {
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }
}