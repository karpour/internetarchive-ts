import { PACKAGE_VERSION } from "../PACKAGE_VERSION";


export function getRuntime(): [runTime: string, version?: string] {
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
