
import { IaFileBaseMetadata, IaFileMetadataRaw } from "../types/IaFileMetadata";
import { IaItem } from "../item/IaItem";
import fs, { mkdirSync, existsSync, statSync, unlinkSync, utimesSync } from "fs";
import path from "path";
import log from "../logging/log";
import { IaBaseFile } from "./IaBaseFile";
import { IaFileDeleteParams, IaFileDownloadParams } from "../types/IaParams";
import { handleIaApiError } from "../util/handleIaApiError";
import { Writable } from 'stream';
import S3Request from "../request/S3Request";
import { getMd5 } from "../util";


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
 * file.download('fabulous_movie_of_stairs.avi')
 * ```
 * 
 * This class also uses IA's S3-like interface to delete a file
 * from an item. You need to supply your IAS3 credentials in
 * environment variables in order to delete:
 * 
 * ```typescript
 * file.delete({accessKey: 'Y6oUrAcCEs4sK8ey', secretKey: 'youRSECRETKEYzZzZ'});
 * ```
 * 
 * You can retrieve S3 keys here: https://archive.org/account/s3.php
 * 
 */
export class IaFile<IaFileMeta extends IaFileBaseMetadata = IaFileBaseMetadata> extends IaBaseFile<IaFileMeta> {
    public readonly url: string;

    /**
     * 
     * @param item The item that the file is part of.
     * @param name The file name of the file.
     * @param fileMetadata Metadata for the given file.
     */
    public constructor(protected item: IaItem, name: string, fileMetadata?: IaFileMetadataRaw<IaFileMeta> | IaFileMeta) {
        super(item, name, fileMetadata);
        this.url = `${item.session.url}/download/${this.identifier}/${encodeURIComponent(name)}`;
    }

    public toString() {
        return `File(identifier=${this.identifier}, filename=${this.name}, size=${this.size}, format=${this.format})`;
    }

    /**
     * Download the file into the current working directory.
     * @param filePath Download file to the given filePath.
     * @param param1.verbose Turn on verbose output.
     * @param param1.ignoreExisting Overwrite local files if they already exist.
     * @param param1.checksum Skip downloading file based on checksum.
     * @param param1.destdir The directory to download files to.
     * @param param1.retries The number of times to retry on failed requests.
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
    public async download(filePath: string = this.name, {
        verbose = false,
        ignoreExisting = false,
        checksum = false,
        destdir,
        retries = 2,
        ignoreErrors = false,
        fileobj,
        returnResponses = false,
        noChangeTimestamp = false,
        params,
        chunkSize = 1048576,
        stdout = false,
        ors = false,
        timeout = 12,
    }: IaFileDownloadParams): Promise<boolean | Response> {
        // TODO
        //this.item.session.mountHttpAdapter({ maxRetries: retries });

        if (destdir) {
            if (!returnResponses) {
                try {
                    mkdirSync(destdir, { recursive: true });
                } catch (err: any) { //except FileExistsError:
                    // pass
                }
            }
            if (!statSync(destdir).isDirectory()) {
                throw new Error(`${destdir} is not a directory!`);
            }
            filePath = path.join(destdir, filePath);
        }

        if (!returnResponses && existsSync(filePath)) {
            if (ignoreExisting) {
                log.info(`skipping "${filePath}", file already exists.`);
                return false;
            } else if (checksum) {
                const md5Sum = await getMd5(filePath);
                if (md5Sum === this.metadata.md5) {
                    log.info(`skipping "${filePath}", file already exists based on checksum.`);
                    return false;
                }
            } else if (!fileobj) {
                const st = statSync(filePath);
                if (((st.mtime.getTime() == this.mtime) && (st.size == this.size)) || this.name.endsWith('_files.xml') && st.size !== 0) {
                    log.verbose(`skipping ${filePath}, file already exists based on length and date.`);
                    return false;
                }
            }

            const parentDir = path.dirname(filePath);

            async function writeReadableStreamToWritable(
                stream: ReadableStream,
                writable: Writable
            ) {
                let reader = stream.getReader();
                let flushable = writable as { flush?: Function; };

                try {
                    while (true) {
                        let { done, value } = await reader.read();

                        if (done) {
                            writable.end();
                            break;
                        }

                        writable.write(value);
                        if (typeof flushable.flush === "function") {
                            flushable.flush();
                        }
                    }
                } catch (error: unknown) {
                    writable.destroy(error as Error);
                    throw error;
                }
            }

            try {
                if (parentDir != '' && !returnResponses) {
                    mkdirSync(parentDir, { recursive: true });
                }

                const response = await this.item.session.get(this.url,
                    {
                        stream: true,
                        timeout,
                        params
                    });
                if (!response.ok) {
                    throw await handleIaApiError({response});
                }
                if (returnResponses) {
                    return response;
                }

                //if (stdout) {
                //    fileobj = process.stdout;
                //}
                //if (!fileobj) {
                //    fileobj = fs.createWriteStream(filePath, { flags: 'wb' });
                //}

                await writeReadableStreamToWritable(response.body!, fs.createWriteStream(filePath, { flags: 'wb' }));

                if (ors) {
                    fileobj?.getWriter().write(process.env.ORS ?? "\n");
                }
            } catch (err: any) {
                log.error(`Error downloading file "${filePath}": ${err.message}`);
                try {
                    unlinkSync(filePath);
                } catch (err: any) {
                }
                if (ignoreErrors) {
                    return false;
                } else {
                    throw err;
                }
            }
        }

        // Set mtime with mtime from files.xml.
        if (!noChangeTimestamp) {
            // If we want to set the timestamp to that of the original archive...
            utimesSync(filePath, 0, this.mtime);
        }

        log.info(`Downloaded "${this.identifier}/${this.name}" to "${filePath}"`);
        return true;
    }

    /**
     * Delete a file from the Archive. 
     * 
     * Note: Some files -- such as `<itemname>_meta.xml` -- can not be deleted.
     * @param param0 
     * @param param0.cascadeDelete Delete all files associated with the specified file, including upstream derivatives and the original.
     * @param param0.accessKey IA-S3 accessKey to use when making the given request.
     * @param param0.secretKey IA-S3 secretKey to use when making the given request.
     * @param param0.verbose Print actions to stdout.
     * @param param0.debug Set to True to print headers to stdout and exit without sending the delete request.
     * @param param0.maxRetries 
     * @param param0.headers 
     * @returns 
     */
    public async delete({
        cascadeDelete,
        accessKey,
        secretKey,
        verbose,
        debug = false,
        maxRetries = 2,
        headers = {},
    }: IaFileDeleteParams): Promise<S3Request | Response> {
        const url = `${this.item.session.protocol}//s3.us.archive.org/${this.identifier}/${encodeURIComponent(this.name)}`;
        /*this.item.session.mountHttpAdapter({
            maxRetries,
            statusForcelist: [503],
            host: 's3.us.archive.org'
        });*/
        const request = new S3Request(url,{
            method: 'DELETE',
            headers: {
                'x-archive-cascade-delete': cascadeDelete ? '1' : '0',
                ...headers
            },
            auth: this.item.session.auth
        });
        if (debug) {
            return request;
        } else {
            if (verbose) {
                let msg = ` deleting: {this.name}`;
                if (cascadeDelete) {
                    msg += ` and all derivative files.`;
                }
                //log.verbose(msg);
            }
            try {
                const response = await this.item.session.send(request);
                if (!response.ok) {
                    throw await handleIaApiError({response});
                }
                return response;
            } catch (err: any) {
                const errorMsg = `Error deleting ${url}`;
                log.error(errorMsg);
                throw err;
            } finally {
                // The retry adapter is mounted to the session object.
                // Make sure to remove it after delete, so it isn't
                // mounted if and when the session object is used for an
                // upload. This is important because we use custom retry
                // handling for IA-S3 uploads.
                //const urlPrefix = `${this.item.session.protocol}//s3.us.archive.org`;
                //delete this.item.session.adapters[urlPrefix];
            }
        }
    }
}

export default IaFile;