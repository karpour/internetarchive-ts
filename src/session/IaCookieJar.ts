import log from "../log/index.js";
import { makeArray } from "../util/index.js";

export default class IaCookieJar {
    protected cookies: Record<string, string> = {};
    protected _cookieHeader: string = "";

    // Parse and store cookies from a Set-Cookie header array
    public addCookies(cookies: string | string[] | Record<string, string | undefined>) {
        if (Array.isArray(cookies) || typeof cookies === "string") {
            cookies = makeArray(cookies);

            for (const header of cookies) {
                const [cookiePart] = header.split(';'); // Only use the key=value part
                if (cookiePart) {
                    const [name, value] = cookiePart.split('=');
                    if (name && value) {
                        this.setCookie(name.trim(), value.trim());
                    }
                }
            }
        } else {
            for (const [key, value] of Object.entries(cookies)) {
                this.setCookie(key, value?.split(';')[0]);
            }
        }
    }

    public setCookie(key: string, value?: string): void {
        if (value) {
            this.cookies[key] = value;
            log.info(`Set cookie ${key}=${value}`);
        }
        this.createCookieHeader();
    }

    public get cookieHeader() {
        return this._cookieHeader;
    }

    // Return a cookie string for use in a Cookie header
    protected createCookieHeader() {
        this._cookieHeader = Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }
}