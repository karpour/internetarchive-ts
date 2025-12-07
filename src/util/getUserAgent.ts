import { PACKAGE_VERSION } from "../PACKAGE_VERSION.js";
import os from "os";

/**
 * @internal
 * Get runtime and version for creating a useragent string
 * @returns Tuple of runtime and optional version
 */
export function getRuntime(): [runTime: string, version?: string] {
    // Browser detection
    if (typeof window !== "undefined" && typeof window.document !== "undefined") {
        /*const nav = navigator as any;

        // Use UA-CH if available (modern browsers)
        if (nav.userAgentData?.brands?.length) {
            const brand = nav.userAgentData.brands.find((b: any) =>
                !/Not A Brand/i.test(b.brand)
            );
            if (brand) {
                return [brand.brand, brand.version];
            }
        }

        // Fallback to userAgent parsing
        const ua = nav.userAgent || "";

        // Very lightweight detection
        if (/Edg\//.test(ua)) {
            return ["Edge", ua.match(/Edg\/([\d.]+)/)?.[1]];
        }
        if (/Chrome\//.test(ua)) {
            return ["Chrome", ua.match(/Chrome\/([\d.]+)/)?.[1]];
        }
        if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
            return ["Safari", ua.match(/Version\/([\d.]+)/)?.[1]];
        }
        if (/Firefox\//.test(ua)) {
            return ["Firefox", ua.match(/Firefox\/([\d.]+)/)?.[1]];
        }
        */
        // Default fallback in browser context
        return ["Browser"];
    }

    // Deno
    if (typeof global !== "undefined" && (global as any).Deno) {
        return ["Deno", (global as any).Deno.version.deno];
    }

    // Node.js
    if (typeof process !== "undefined" && process.versions?.node) {
        return ["Node.js", process.version];
    }

    return ["UnknownRuntime"];
}

const runtimeTuple = getRuntime();

/**
 * Creates a user agent string for this library
 * @param accessKey Optional access key
 * @returns Generated user agent string. If the library runs in the browser, the browser user agent is returned
 */
export function getUserAgent(accessKey?: string): string {
    const [runtime, version] = runtimeTuple;
    if (runtime !== 'Browser') {
        const lang = Intl.DateTimeFormat().resolvedOptions().locale;
        return `internetarchive/${PACKAGE_VERSION} (${os.platform()} ${os.release()}; N; ${lang}${accessKey ? `; ${accessKey}` : ''}) ${runtime}${version ? `/${version}` : ''}`;
    }
    // TODO should we always return the package UA?
    return window.navigator.userAgent;
};

export default getUserAgent;
