import path from "path";
import fs, { mkdirSync, statSync, unlinkSync, utimesSync } from "fs";
import { Writable } from 'stream';
import log from "../log/index.js";

import S3Request from "../request/S3Request.js";
import { IaFileExtendedMetadata, IaFileSourceMetadata } from "../types/IaFileMetadata.js";
import { IaItem } from "../item/IaItem.js";
import { IaBaseFile } from "./IaBaseFile.js";
import {
    getMd5,
    writeReadableStreamToWritable,
    handleIaApiError,
    retry
} from "../util/index.js";
import {
    IaBaseMetadataType,
    IaFileDeleteParams,
    IaFileDownloadParams
} from "../types/index.js";

function getTargetFile(target: string, defaultFilename: string): string {
    if (fs.existsSync(target)) {
        // Target exists
        if (statSync(target).isDirectory()) {
            // Target is dir, save using default file name
            return path.join(target, defaultFilename);
        } else {
            // Target exists and is file, 
            return target;
        }
    } else {
        if (target.endsWith('\\') || target.endsWith('/')) {
            // Target is directory
            mkdirSync(target, { recursive: true });
            return path.join(target, defaultFilename);
        } else {
            mkdirSync(path.dirname(target), { recursive: true });
            return target;
        }
    }
}


/**
 * This class represents a file in an archive.org item. 
 * You can use this class to access the file metadata.
 * 
 * ```typescript
 * const item = await getItem('stairs');
 * const file = item.getFile('stairs.avi');
 * if (file) {
 *     console.log(`${file.format}, ${file.size}`); // Cinepack, 3786730
 * }
 * ```
 * 
 * Or to download a file:
 * 
 * ```typescript
 * file.download();
 * ```
 * 
 * This class also uses IA's S3-like interface to delete a file
 * from an item. You need to supply your IAS3 credentials in
 * environment variables in order to delete:
 * 
 * ```typescript
 * file.delete();
 * ```
 * 
 * You can retrieve S3 keys {@link https://archive.org/account/s3.php | here}.
 * 
 */
export class IaFile<IaFileMeta extends IaBaseMetadataType = IaFileExtendedMetadata> extends IaBaseFile<IaFileMeta> {
    public readonly url: string;

    /**
     * 
     * @param item The item that the file is part of.
     * @param name The file name of the file.
     * @param fileMetadata Metadata for the given file.
     */
    public constructor(protected item: IaItem, fileMetadata: IaFileSourceMetadata<IaFileMeta>) {
        super(item, fileMetadata);
        this.url = `${item.session.url}/download/${this.identifier}/${encodeURIComponent(this.name)}`;
    }

    public toString() {
        return `IaFile(identifier=${this.identifier}, filename=${this.name}, size=${this.size}, format=${this.format})`;
    }

    /**
     * Download the file into the current working directory.
     * @param param0.ignoreExisting Overwrite local files if they already exist.
     * @param param0.checksum Skip downloading file based on checksum.
     * @param param0.target The directory/file or Writeable to download the to.
     * @param param0.retries The number of times to retry on failed requests. (default:`2`)
     * @param param0.returnResponses Rather than downloading files to disk, return a list of response objects.
     * @param param0.noChangeTimestamp If True, leave the time stamp as the current time instead of changing it to that given in the original archive.
     * @param param0.params URL parameters to send with download request (e.g. `cnt=0`).
     * @param param0.chunkSize 
     * @param param0.ors (optional) Append a newline or $ORS to the end of file. This is mainly intended to be used internally with `stdout`.
     * @param param0.timeout 
     * 
     * @returns true if file was successfully downloaded.
     */
    public async download({
        ignoreExisting = false,
        checksum = false,
        retries = 2,
        ignoreErrors = false,
        target = '.',
        returnResponses = false,
        noChangeTimestamp = false,
        params,
        chunkSize = 1048576,
        ors = false,
        timeout = 12000,
    }: IaFileDownloadParams): Promise<boolean | Response> {
        let targetPath = typeof target == "string" && getTargetFile(target, this.name);

        const getWriteable: (targetPath?: string) => Writable = () => {
            if (typeof target === "string") {
                let targetPath = getTargetFile(target, this.name);
                return fs.createWriteStream(targetPath, { flags: 'w' });
            } else {
                return target;
            }
        };

        if (targetPath && fs.existsSync(targetPath)) {
            if (ignoreExisting) {
                log.info(`skipping "${targetPath}", file already exists.`);
                return false;
            } else if (checksum) {
                const md5Sum = await getMd5(targetPath);
                if (md5Sum === this.metadata.md5) {
                    log.info(`skipping "${targetPath}", file already exists based on checksum.`);
                    return false;
                }
            } else {
                const st = statSync(targetPath);
                if (((st.mtime.getTime() == this.mtime) && (st.size == this.size)) || this.name.endsWith('_files.xml') && st.size !== 0) {
                    log.verbose(`skipping ${targetPath}, file already exists based on length and date.`);
                    return false;
                }
            }
        }

        let lastError: Error | undefined;
        let success: boolean = false;
        const errCount = 0;
        do {
            if (errCount) log.verbose(`Retry ${errCount} for file ${this}`);
            let targetWritable: Writable | undefined = undefined;
            try {

                const response = await this.item.session.get(this.url, { timeout, params });

                if (!response.ok) {
                    throw await handleIaApiError({ response });
                }

                if (returnResponses) {
                    return response;
                }

                // If no targetWritable is supplied, write to file
                targetWritable ??= getWriteable();

                await writeReadableStreamToWritable(response.body!, targetWritable);

                if (ors) {
                    targetWritable.write(process?.env?.ORS ?? "\n");
                }
                success = true;
                break;
            } catch (err: any) {
                log.error(`Error downloading file "${targetPath}": ${err.message}`);
                /*try {
                    targetPath && unlinkSync(targetPath);
                } catch (err: any) {
                    log.error(`Could not unlink file "${targetPath}"`)
                }*/
                if (!ignoreErrors) {
                    lastError = err;
                }
            } finally {
                targetWritable?.end();
            }
        } while (errCount < retries);

        if (!success) {
            throw lastError ?? new Error(`Error downloading file "${targetPath}"`);
        }

        // Set mtime with mtime from files.xml.
        if (!noChangeTimestamp && targetPath) {
            // If we want to set the timestamp to that of the original archive...
            utimesSync(targetPath, 0, this.mtime);
        }

        log.verbose(`Downloaded "${this.identifier}/${this.name}" to "${targetPath ? targetPath : '<Writable>'}"`);
        return true;
    }

    /**
     * Delete a file from the Archive. 
     * 
     * Note: Some files -- such as `<itemname>_meta.xml` -- can not be deleted.
     * @param param0 
     * @param param0.cascadeDelete Delete all files associated with the specified file, including upstream derivatives and the original.
     * @param param0.retries The number of times to retry on failed requests.
     * @param param0.headers URL parameters to send with download request
     * @returns 
     */
    public async delete({
        cascadeDelete,
        retries = 0,
        headers = {},
    }: IaFileDeleteParams): Promise<Response> {
        if (retries) return retry(() => this.delete({ cascadeDelete, headers }), retries);

        const url = `${this.item.session.protocol}//s3.us.archive.org/${this.identifier}/${encodeURIComponent(this.name)}`;

        const request = new S3Request(url, {
            method: 'DELETE',
            headers: {
                'x-archive-cascade-delete': cascadeDelete ? '1' : '0',
                ...headers
            },
            auth: this.item.session.auth
        });

        log.verbose(`Deleting: ${this.name}${cascadeDelete && " and all derivative files."}`);

        try {
            const response = await this.item.session.send(request);
            if (!response.ok) {
                throw await handleIaApiError({ request, response });
            }
            return response;
        } catch (err: any) {
            log.error(`Error deleting "${url}"`);
            log.error(err);
            throw err;
        }
    }
}

export default IaFile;