import fs from 'fs';
import { makeArray } from './makeArray';
import { getMd5 } from './getMd5';
import { recursiveIterDirectory } from './recursiveIterDirectory';


export async function recursiveFileCount(files: string | string[], md5s?: string[]): Promise<number> {
    files = makeArray(files);
    const checkSumsIncludes = async (filePath: string): Promise<boolean> => {
        if (md5s) {
            // Handle errors, e.g., file not found, permission issues
            return getMd5(filePath).then(md5 => md5s.includes(md5)).catch(() => false);
        }
        return false;
    };
    let totalFiles = 0;

    for (const file of files) {
        try {
            if ((await fs.promises.stat(file)).isDirectory()) {
                for (const x in recursiveIterDirectory(file)) {
                    if (md5s && await checkSumsIncludes(x)) continue;
                    totalFiles++;
                }
            } else {
                if (md5s && await checkSumsIncludes(file)) continue;
                totalFiles++;
            }
        } catch (error) {
            // Handle errors, e.g., file not found, permission issues
        }
    }
    return totalFiles;
}