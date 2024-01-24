import fs from 'fs';
import { createHash } from "crypto";

export function getMd5(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');
        const fileStream = fs.createReadStream(fileName, 'utf-8');

        fileStream.on('data', d => hash.update(d));
        fileStream.on('end', () => resolve(hash.digest('hex')));
        fileStream.on('error', err => reject(err));
    });
}
