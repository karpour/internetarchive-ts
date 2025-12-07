
import { IaFileBaseMetadata, IaFileExtendedMetadata, IaFileMetadataRaw, IaFileSourceMetadata } from "../types/IaFileMetadata.js";
import { IaItem } from "../item/IaItem.js";
import fs, { mkdirSync, existsSync, statSync, unlinkSync, utimesSync } from "fs";
import path from "path";
import log from "../log/index.js";
import { IaBaseFile } from "./IaBaseFile.js";
import { IaFileDeleteParams, IaFileDownloadParams } from "../types/IaParams.js";
import { handleIaApiError } from "../util/handleIaApiError.js";
import { Writable } from 'stream';
import S3Request from "../request/S3Request.js";
import { getMd5 } from "../util/index.js";
import { IaBaseMetadataType } from "../types/index.js";
import { writeReadableStreamToWritable } from "../util/writeReadableStreamToWritable.js";

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
 * import {IaItem, IaFile} from 'internetarchive';
 * let item = internetarchive.Item('stairs');
 * let file = internetarchive.File(item, 'stairs.avi');
 * console.log(`${f.format}, ${f.size}`);
 * // ('Cinepack', '3786730')
 * ```
 * 
 * Or to download a file:
 * 
 * ```typescript
 * file.download()
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
 * You can retrieve S3 keys here: https://archive.org/account/s3.php
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
     * @param filePath Download file to the given filePath.
     * @param param1.verbose Turn on verbose output.
     * @param param1.ignoreExisting Overwrite local files if they already exist.
     * @param param1.checksum Skip downloading file based on checksum.
     * @param param1.destdir The directory to download files to.
     * @param param1.retries The number of times to retry on failed requests. (default:`2`)
     * @param param1.ignoreErrors Don't fail if a single file fails to download, continue to download other files.
     * @param param1.fileobj Write data to the given file-like object (e.g. sys.stdout).
     * @param param1.returnResponses Rather than downloading files to disk, return a list of response objects.
     * @param param1.noChangeTimestamp If True, leave the time stamp as the current time instead of changing it to that given in the original archive.
     * @param param1.params URL parameters to send with download request (e.g. `cnt=0`).
     * @param param1.chunkSize 
     * @param param1.stdout Print contents of file to stdout instead of downloading to file.
     * @param param1.ors (optional) Append a newline or $ORS to the end of file. This is mainly intended to be used internally with `stdout`.
     * @param param1.timeout 
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
        timeout = 12,
    }: IaFileDownloadParams): Promise<boolean | Response> {
        let targetPath = typeof target == "string" && getTargetFile(target, this.name);

        const getWriteable: (targetPath?: string) => Writable = () => {
            if (typeof target === "string") {
                let targetPath = getTargetFile(target, this.name);
                return fs.createWriteStream(targetPath, { flags: 'wb' });
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


        const errCount = 0;
        do {
            if (errCount) log.verbose(`Retry ${errCount} for file ${this}`);
            let targetWritable: Writable | undefined = undefined;
            try {

                const response = await this.item.session.get(this.url,
                    {
                        stream: true,
                        timeout,
                        params
                    });

                if (!response.ok) {
                    throw await handleIaApiError({ response });
                }

                if (returnResponses) {
                    return response;
                }

                // If no targetWritable is supplied, write to file
                targetWritable = getWriteable();

                await writeReadableStreamToWritable(response.body!, targetWritable);

                if (ors) {
                    targetWritable.write(process.env.ORS ?? "\n");
                }

                targetWritable.end();
                continue;
            } catch (err: any) {
                log.error(`Error downloading file "${targetPath}": ${err.message}`);
                try {
                    targetPath && unlinkSync(targetPath);
                    targetWritable?.end();
                } catch (err: any) {
                }
                if (ignoreErrors) {
                    return false;
                } else {
                    throw err;
                }
            }
        } while (errCount < retries);

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
     * @param param0.maxRetries The number of times to retry on failed requests.
     * @param param0.headers URL parameters to send with download request
     * @returns 
     */
    public async delete({
        cascadeDelete,
        retries = 2,
        headers = {},
    }: IaFileDeleteParams): Promise<Response> {
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