import fs from 'fs';
import path from "path";

export async function* recursiveIterDirectory(directoryPath: string): AsyncGenerator<string> {
    const entries = await fs.promises.readdir(directoryPath);
    for (const entry of entries) {
        const entryPath = path.join(directoryPath, entry);
        const isDir = (await fs.promises.stat(entryPath)).isDirectory();
        if (isDir) {
            yield* recursiveIterDirectory(entryPath);
        } else {
            yield entryPath;
        }
    }
}

export async function* recursiveIterDirectoryWithKeys(directoryPath: string): AsyncGenerator<[filePath: string, key: string]> {
    for (const filePath in recursiveIterDirectory(directoryPath)) {
        yield [filePath, path.relative(directoryPath, filePath)];
    }
}