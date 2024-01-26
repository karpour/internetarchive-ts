import path from "path";

export function normFilepath(fp: Buffer | string): string {
    let fpStr: string = (fp instanceof Buffer) ? fp.toString('utf-8') : fp;
    fpStr = fpStr.replaceAll(path.sep, '/');
    if (!fpStr.startsWith('/')) {
        fpStr = `/${fpStr}`;
    }
    return fpStr;
}