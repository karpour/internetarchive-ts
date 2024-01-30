import fs from 'fs';
import { createHash } from "crypto";
import { IaTypeError } from '../error';

export function getMd5(body: string | Buffer | Blob): Promise<string> {
    if (typeof body === "string") {
        return getMd5FromFile(body);
    } else if (body instanceof Buffer) {
        return getMd5FromBuffer(body);
    } else if (body instanceof Blob) {
        return getMd5FromBlob(body);
    } else {
        throw new IaTypeError(`getMd5 expects string, Buffer or Blob`);
    }
}

export function getMd5FromFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');
        const fileStream = fs.createReadStream(filePath, 'utf-8');

        fileStream.on('data', d => hash.update(d));
        fileStream.on('end', () => resolve(hash.digest('hex')));
        fileStream.on('error', err => reject(err));
    });
}

export async function getMd5FromBuffer(buffer: Buffer): Promise<string> {
    return createHash('md5').update(buffer).digest('hex');
}

export async function getMd5FromBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');
        var reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = async function () {
            if (reader.result) {
                crypto.subtle.digest("md5", reader.result as ArrayBuffer)
                    .then(hash => resolve(new TextDecoder("utf-8").decode(hash)));
            } else {
                reject(`Could not get md5 from blob`);
            }
        };
    });
}