import { PACKAGE_VERSION } from "../PACKAGE_VERSION";

/**
 * Get runtime and version for creating a useragent string
 * @returns Tuple of runtime and optional version
 */
export function getRuntime(): [runTime: string, version?: string] {
    // TODO figure out which browser
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        return ['Browser'];
    } else if (typeof global !== 'undefined' && (global as any).Deno) {
        return ['Deno', (global as any).Deno.version.deno];
    } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        return ['Node.js', process.version];
    } else {
        return ['UnknownRuntime'];
    }
}

/**
 * Creates a user agent string for this library
 * @param accessKey Optional access key
 * @returns Generated user agent string. If the library runs in the browser, the browser user agent is returned
 */
export default function getUserAgentString(accessKey?: string): string {
    const [runTime, version] = getRuntime();
    if (runTime !== 'Browser') {
        const lang = Intl.DateTimeFormat().resolvedOptions().locale;
        const os = require("os");
        return `internetarchive/${PACKAGE_VERSION} (${os.platform()} ${os.release()}; N; ${lang}${accessKey ? `; ${accessKey}` : ''}) ${runTime}${version ? `/${version}` : ''}`;
    }
    // todo
    return window.navigator.userAgent;
};
