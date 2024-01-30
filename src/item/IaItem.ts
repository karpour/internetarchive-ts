import CatalogTask from "../catalog/CatalogTask";
import log from "../logging/log";
import { IaBaseMetadataType, IaFileBaseMetadata, IaFixerData, IaGetTasksBasicParams, IaGetTasksParams, IaItemData, IaItemPostReview, IaItemUrls } from "../types";
import { IaItemMetadata } from "../types/IaItemMetadata";
import path from "path";
import IaSession from "../session/IaSession";
import { HttpHeaders, HttpParams, IA_ITEM_URL_TYPES, IaFixerOp, IaItemDeleteReviewParams, IaItemUrlType } from "../types";
import { IaTaskPriority } from "../types/IaTask";
import { IaItemDownloadParams, IaItemGetFilesParams, IaItemModifyMetadataParams, IaItemUploadFileParams } from "../types/IaParams";
import { IaBaseItem } from "./IaBaseItem";
import { handleIaApiError } from "../util/handleIaApiError";
import { arrayFromAsyncGenerator } from "../util/arrayFromAsyncGenerator";
import { getMd5, makeArray, patternsMatch } from "../util";
import { IaMetadataRequest } from "../request/IaMetadataRequest";
import { IaFile } from "../files";
import sleepMs from "../util/sleepMs";
import { IaApiError, IaApiFileUploadError, IaApiServiceUnavailableError, IaTypeError } from "../error";
import S3Request from "../request/S3Request";
import { getFileSize } from "../util/getFileSize";
import { createReadStream } from "fs";
import lstrip from "../util/lstrip";
import { normFilepath } from "../util/normFilePath";
import { readStreamToReadableStream } from "../util/readStreamToReadableStream";

/** 
 * This class represents an archive.org item. Generally this class
 * should not be used directly, but rather via the
 * {@link getItem} function.
 * 
 * This class also uses IA's S3-like interface to upload files to an
 * item. You need to supply your IAS3 credentials in order to upload
 * 
 * You can retrieve S3 keys {@link https://archive.org/account/s3.php | here}
 * 
 * @example // Get Item
 * import getItem from "internetarchive-ts";
 * const item = await getItem('stairs');
 * console.log(item.metadata);
 * 
 * @example // Modify the metadata for an item
 * const metadata = {title: 'The Stairs'}
 * await item.modifyMetadata(metadata)
 * console.log(item.metadata['title']) // 'The Stairs'
 * 
 * @example // Upload
 * await item.upload('myfile.tar', access_key='Y6oUrAcCEs4sK8ey', secret_key='youRSECRETKEYzZzZ') // true
 */
export class IaItem<ItemMetaType extends IaItemMetadata = IaItemMetadata> extends IaBaseItem<ItemMetaType> {
    public static getMd5:((body:Blob|string|Buffer) => Promise<string>) = getMd5;

    /** A copyable link to the item, in MediaWiki format */
    public readonly wikilink?: string;
    static readonly DEFAULT_URL_FORMAT = (itm: IaItem, path: string) => `${itm.session.protocol}//${itm.session.host}/${path}/${itm.identifier}`;

    /** Item URL types */
    public readonly urls: IaItemUrls;
    /** Session that this Instance uses to access the API */
    public readonly session: IaSession;

    private getMd5:((body:Blob|string|Buffer) => Promise<string>) = IaItem.getMd5;

    // TODO tasks
    tasks: any;

    /**
     * 
     * @param archiveSession 
     * @param identifier The globally unique Archive.org identifier for this item.
     *     
     *        An identifier is composed of any unique combination of
     *        alphanumeric characters, underscore (`_`) and dash (`-`).While
     *        there are no official limits it is strongly suggested that they
     *        be between 5 and 80 characters in length. Identifiers must be
     *        unique across the entirety of Internet Archive, not simply
     *        unique within a single collection.
     *        
     *        Once defined an identifier can not be changed. It will travel
     *        with the item or object and is involved in every manner of
     *        accessing or referring to the item.
     * 
     * @param itemMetadata The Archive.org item metadata used to initialize this item.
     */
    public constructor(
        archiveSession: IaSession,
        itemData: IaItemData<ItemMetaType>,
    ) {
        super(itemData);
        this.session = archiveSession;
        this.urls = this.makeUrls();

        if (this.metadata.title) {
            this.wikilink = `* [${this.urls.details} ${this.identifier}] -- ${this.metadata.title}`;
        }
    }

    protected makeUrls(): IaItemUrls {
        return Object.fromEntries(IA_ITEM_URL_TYPES.map(urlType => [urlType, this.makeURL(urlType)])) as IaItemUrls;
    }

    protected makeURL<Path extends IaItemUrlType>(path: Path, urlFormat: ((itm: IaItem, path: string) => string) = IaItem.DEFAULT_URL_FORMAT): string {
        return urlFormat(this, path);
    }

    public get paths(): Readonly<string[]> {
        return IA_ITEM_URL_TYPES;
    }

    public async refresh(itemMetadata?: IaItemData<ItemMetaType>): Promise<void> {
        this.load(itemMetadata ?? await this.session.getMetadata(this.identifier) as IaItemData<ItemMetaType>);
    }

    /**
     * Get a summary of the item's pending tasks.
     * @param params Params to send with your request.
     * @returns A summary of the item's pending tasks.
     */
    public getTaskSummary(params?: IaGetTasksParams): Record<string, string> {
        return this.session.getTasksSummary(this.identifier, params);
    }

    /**
     * Check if there is any pending task for the item.
     * @param params Params to send with your request.
     * @returns true if no tasks are pending, otherwise false.
     */
    public async noTasksPending(params?: IaGetTasksParams): Promise<boolean> {
        const taskSummaries = await this.getTaskSummary(params);
        // TODO not sure about this
        return Object.values(taskSummaries).every(t => t == "0");
    }

    /**
     * Get a list of all tasks for the item, pending and complete.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns A list of all tasks for the item, pending and complete.
     */
    public getAllItemTasks(params: Omit<IaGetTasksParams, 'identifier' | 'catalog' | 'history'> = {}): Promise<CatalogTask[]> {
        return this.session.getTasks({
            identifier: this.identifier,
            ...params,
            catalog: 1,
            history: 1
        });
    }

    /**
     * Get a list of completed catalog tasks for the item.
     * @param params Params to send with your request.
     * @returns A list of completed catalog tasks for the item.
     */
    public async getHistory(params?: IaGetTasksBasicParams): Promise<CatalogTask[]> {
        return arrayFromAsyncGenerator(this.session.iterHistory(this.identifier, params));
    }

    /**
     * Get a list of pending catalog tasks for the item.
     * @param params Params to send with your request.
     * @returns A list of pending catalog tasks for the item.
     */
    public async getCatalog(params?: IaGetTasksBasicParams): Promise<CatalogTask[]> {
        return arrayFromAsyncGenerator(this.session.iterCatalogTasks(this.identifier, params));
    }

    /**
     * Derive an item.
     * @param priority Task priority from 10 to -10 [default: 0]
     * @param removeDerived You can use wildcards ("globs")
     *        to only remove *some* prior derivatives.
     *        For example, "*" (typed without the
     *        quotation marks) specifies that all
     *        derivatives (in the item's top directory)
     *        are to be rebuilt. "*.mp4" specifies that
     *        all "*.mp4" deriviatives are to be rebuilt.
     *        "{*.gif,*thumbs/*.jpg}" specifies that all
     *        GIF and thumbs are to be rebuilt.
     * @param reducedPriority Submit your derive at a lower priority.
     *        This option is helpful to get around rate-limiting.
     *        Your task will more likely be accepted, but it might
     *        not run for a long time. Note that you still may be
     *        subject to rate-limiting.
     * @param data 
     * @param headers 
     * @returns 
     */
    public async derive(priority: IaTaskPriority = 0, removeDerived?: string, reducedPriority: boolean = false, data: Record<string, any> = {}, headers?: HttpHeaders): Promise<Response> {
        if (removeDerived) {
            if (!data.args) {
                data.args = { removeDerived: removeDerived };
            } else {
                data.args.removeDerived = removeDerived;
            }
        }
        const response = await this.session.submitTask(
            this.identifier,
            'derive.php',
            '',
            priority,
            data,
            headers,
            reducedPriority);
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }


    /**
     * Submit a fixer task on an item.
     * @param ops The fixer operation(s) to run on the item. default: `"noop"`
     * @param priority The task priority.
     * @param reducedPriority Submit your derive at a lower priority.
     *        This option is helpful to get around rate-limiting.
     *        Your task will more likely be accepted, but it might
     *        not run for a long time. Note that you still may be
     *        subject to rate-limiting. This is different than
     *        `priority` in that it will allow you to possibly
     *        avoid rate-limiting.
     * @param data Additional parameters to submit with the task.
     * @param headers Additional HTTP headers
     * @returns 
     */
    public async fixer(
        ops: IaFixerOp | IaFixerOp[] = 'noop',
        priority: IaTaskPriority = 0,
        reducedPriority: boolean = false,
        data: IaFixerData = {},
        headers?: HttpHeaders
    ): Promise<Response> {
        const operations = makeArray(ops);
        data.args ??= {};
        for (let op of operations) {
            data.args[op] = '1';
        }

        const response = await this.session.submitTask(this.identifier, 'fixer.php', '', priority, data, headers, reducedPriority);
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }

    /**
     * Undark the item.
     * @param comment The curation comment explaining reason for undarking item
     * @param priority The task priority.
     * @param reducedPriority Submit your derive at a lower priority.
     *        This option is helpful to get around rate-limiting.
     *        Your task will more likely be accepted, but it might
     *        not run for a long time. Note that you still may be
     *        subject to rate-limiting. This is different than
     *        ``priority`` in that it will allow you to possibly
     *        avoid rate-limiting.
     * @param data Additional parameters to submit with the task.
     * @returns 
     */
    public async undark(comment: string, priority: IaTaskPriority = 0, reducedPriority: boolean = false, data?: Record<string, any>): Promise<Response> {
        const response = await this.session.submitTask(
            this.identifier,
            'make_undark.php',
            comment,
            priority,
            data,
            undefined,
            reducedPriority);
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }

    // TODO: dark and undark have different order for data and reduced_priority

    /**
     * Dark the item.
     * @param comment The curation comment explaining reason for darking item
     * @param priority The task priority.
     * @param data Additional parameters to submit with the task.
     * @param reducedPriority Submit your derive at a lower priority.
     *        This option is helpful to get around rate-limiting.
     *        Your task will more likely be accepted, but it might
     *        not run for a long time. Note that you still may be
     *        subject to rate-limiting. This is different than
     *        `priority` in that it will allow you to possibly
     *        avoid rate-limiting.
     * @returns 
     */
    public async dark(comment: string, priority: IaTaskPriority = 0, data?: Record<string, any>, reducedPriority: boolean = false): Promise<Response> {
        const response = await this.session.submitTask(
            this.identifier,
            'make_dark.php',
            comment,
            priority,
            data,
            undefined,
            reducedPriority);
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }

    /**
     * 
     * @returns 
     */
    public async getReview(): Promise<Response> {
        const url = `${this.session.url}/services/reviews.php`;
        const params = { identifier: this.identifier };
        const response = await this.session.get(url, { params });
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }

    /**
     * 
     * @param username 
     * @param screenname 
     * @param itemname 
     * @returns 
     */
    public async deleteReview(data: IaItemDeleteReviewParams): Promise<Response> {
        const url = `${this.session.url}/services/reviews.php`;
        const params = { identifier: this.identifier };
        const response = await this.session.delete(url, { params, json: data });
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }

    /**
     * 
     * @param title 
     * @param body 
     * @param stars 
     * @returns 
     */
    public async review(review: IaItemPostReview): Promise<Response> {
        const url = `${this.session.url}/services/reviews.php`;
        const params: HttpParams = { identifier: this.identifier };
        const response = await this.session.post(url, { params, json: review });
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }

    /**
     * Get a {@link IaFile} object for the named file.
     * @param fileName 
     * @param fileMetadata a dict of metadata for the given file.
     * @returns 
     */
    public getFile<IaFileMeta extends IaFileBaseMetadata>(fileName: string, fileMetadata?: IaFileMeta): IaFile<IaFileMeta> {
        return new IaFile<IaFileMeta>(this, fileName, fileMetadata);
    }


    /**
     * 
     * @param getFilesParams 
     * @param getFilesParams.formats 
     * @param getFilesParams.globPattern 
     * @param getFilesParams.excludePattern 
     * @param getFilesParams.onTheFly 
     */
    public *getFiles<IaFileMeta extends IaFileBaseMetadata>(
        {
            files = [],
            formats = [],
            globPattern,
            excludePattern,
            // onTheFly = false
        }: IaItemGetFilesParams): Generator<IaFile<IaFileMeta>> {
        files = makeArray(files);
        formats = makeArray(formats);

        const itemFiles = [...this.files];
        // Add support for on-the-fly files (e.g. EPUB).
        // TODO make sure otf is still a thing?
        /**if (onTheFly) {
            const otfFiles: [string, string][] = [
                ['EPUB', `${this.identifier}.epub`],
                ['MOBI', `${this.identifier}.mobi`],
                ['DAISY', `${this.identifier}_daisy.zip`],
                ['MARCXML', `${this.identifier}_archive_marc.xml`],
            ];
            for (let [format, fileName] of otfFiles) {
                itemFiles.push({ name: fileName, format, otf: true });
            }
        }*/
        if (!files?.length && !formats?.length && !globPattern?.length) {
            for (let f of itemFiles) {
                yield this.getFile<IaFileMeta>(f.name, f as IaFileMeta);
            }
        } else {
            for (let f of itemFiles) {
                const format = typeof f.format === "string" && f.format;
                if (files.includes(f.name)) {
                    yield this.getFile(f.name);
                } else if (format && formats?.includes(format)) {
                    yield this.getFile(f.name);
                } else if (globPattern) {
                    const globPatterns = Array.isArray(globPattern) ? globPattern : globPattern.split('|');
                    const exclPatterns = Array.isArray(excludePattern) ? excludePattern : excludePattern?.split('|') ?? [];
                    if (patternsMatch(f.name, globPatterns) && !patternsMatch(f.name, exclPatterns)) {
                        yield this.getFile(f.name);
                    }
                }
            }
        }
    }



    /**
     * 
     * @param param1 Download file parameters
     * @param param1.files Only download files matching given file names.
     * @param param1.formats Only download files matching the given Formats.
     * @param param1.globPattern Only download files matching the given glob pattern.
     * @param param1.excludePattern Exclude files whose filename matches the given glob pattern.
     * @param param1.dryRun Output download URLs to stdout, don't download anything.
     * @param param1.verbose Turn on verbose output.
     * @param param1.ignoreExisting Skip files that already exist locally.
     * @param param1.checksum Skip downloading file based on checksum.
     * @param param1.destdir The directory to download files to.
     * @param param1.noDirectory Download files to current working directory rather than creating an item directory.
     * @param param1.retries The number of times to retry on failed requests.
     * @param param1.itemIndex The index of the item for displaying progress in bulk downloads.
     * @param param1.ignoreErrors Don't fail if a single file fails to download, continue to download other files.
     * @param param1.onTheFly Download on-the-fly files (i.e. derivative EPUB, MOBI, DAISY files).
     * @param param1.returnResponses Rather than downloading files to disk, return a list of response objects.
     * @param param1.noChangeTimestamp If true, leave the time stamp as the current time instead of changing it to that given in the original archive.
     * @param param1.ignoreHistoryDir Do not download any files from the history dir. This param defaults to ``false``.
     * @param param1.source Filter files based on their source value in files.xml (i.e. `original`, `derivative`, `metadata`).
     * @param param1.excludeSource Filter files based on their source value in files.xml (i.e. `original`, `derivative`, `metadata`).
     * @param param1.stdout 
     * @param param1.params URL parameters to send with download request (e.g. `cnt=0`).
     * @param param1.timeout 
     * 
     * @returns true if if all files have been downloaded successfully.
     */
    public async download(
        {
            files,
            formats,
            globPattern,
            excludePattern,
            dryRun = false,
            verbose = false,
            ignoreExisting = false,
            checksum = false,
            destdir,
            noDirectory = false,
            retries = 10,
            itemIndex,
            ignoreErrors = false,
            onTheFly = false,
            returnResponses = false,
            noChangeTimestamp = false,
            ignoreHistoryDir = false,
            source = [],
            excludeSource = [],
            stdout = false,
            params,
            timeout = 120
        }: IaItemDownloadParams = {}
    ): Promise<Response[] | string[]> {

        if (source && !Array.isArray(source)) source = [source];
        if (excludeSource && !Array.isArray(excludeSource)) excludeSource = [excludeSource];

        let fileobj: any;
        if (stdout) {
            // TODO
            //fileobj = os.fdopen(sys.stdout.fileno(), "wb", closefd=false)
            verbose = false;
        } else {
            fileobj = undefined;
        }

        if (dryRun) {
            if (itemIndex && verbose) {
                console.error(`${this.identifier} (${itemIndex}):`);
            } else if (!itemIndex && verbose) {
                console.error(`${this.identifier}:`);
            }
        }

        if (this.is_dark) {
            let msg = `skipping ${this.identifier}, item is dark`;
            log.warning(msg);
            if (verbose)
                console.error(` ${msg}`);
            return [];
        } else if (Object.keys(this.metadata).length === 0) {
            let msg = `skipping ${this.identifier}, item does not exist.`;
            log.warning(msg);
            if (verbose)
                console.error(` ${msg}`);
            return [];
        }


        let gFiles!: IaFile[] | Generator<IaFile>;
        if (globPattern) {
            gFiles = this.getFiles({ globPattern, excludePattern, onTheFly });
        } else if (formats) {
            gFiles = this.getFiles({ formats, onTheFly });
        } else {
            gFiles = this.getFiles({ onTheFly });
        }
        let numFiles: number = 0;
        if (stdout) {
            gFiles = Array.from(gFiles); // # type: ignore
            numFiles = gFiles.length;
        }

        let errors: string[] = [];
        let downloaded = 0;
        let responses: Response[] = [];
        let fileCount = 0;

        for (let file of gFiles) {
            if (ignoreHistoryDir) {
                if (file.name.startsWith('history/')) {
                    continue;
                }
            }
            if (source && !source.includes(file.source)) {
                continue;
            }
            if (excludeSource && excludeSource.includes(file.source)) {
                continue;
            }
            fileCount++;
            let filePath = noDirectory ? file.name : path.join(this.identifier, file.name);
            if (dryRun) {
                console.log(file.url);
                continue;
            }
            const ors = (stdout && fileCount < numFiles);
            const response = await file.download(filePath, {
                verbose,
                ignoreExisting,
                checksum,
                destdir,
                retries,
                ignoreErrors,
                fileobj,
                returnResponses,
                noChangeTimestamp,
                params,
                stdout,
                ors,
                timeout
            });
            if (returnResponses) {
                responses.push(response as Response);

                if (!response) {
                    errors.push(file.name);
                } else {
                    downloaded += 1;
                }

            }
            if (fileCount == 0) {
                const msg = `skipping {this.identifier}, no matching files found.`;
                log.info(msg);
                if (verbose) {
                    console.error(` ${msg}`);
                }
                return [];
            }
        }
        return returnResponses ? responses : errors;
    }

    /**
     * Modify the metadata of an existing item on Archive.org.
     * 
     * Note: The Metadata Write API does not yet comply with the
     * latest Json-Patch standard. It currently complies with 
     * {@link https://tools.ietf.org/html/draft-ietf-appsawg-json-patch-02 | version 02}
     * 
     * @example
     * import {IaItem} from 'internetarchive-ts';
     * const item = new IaItem('mapi_test_item1');
     * const md = {'new_key': 'new_value', 'foo': ['bar', 'bar2']};
     * item.modifyMetadata(md);
     * 
     * @param metadata Metadata used to update the item.
     * @param param1.target Set the metadata target to update.
     * @param param1.append Append value to an existing multi-value metadata field.
     * @param param1.appendList Append values to an existing multi-value metadata field. No duplicate values will be added.
     * @param param1.insert 
     * @param param1.priority Set task priority.
     * @param param1.debug 
     * @param param1.headers 
     * @param param1.timeout 
     * @returns A Request if debug else a Response.
     */
    public async modifyMetadata(metadata: ItemMetaType, {
        target,
        append = false,
        appendList = false,
        insert = false,
        priority = 0,
        debug = false,
        headers = {},
    }: IaItemModifyMetadataParams): Promise<Request | Response> {
        headers = { ...this.session.headers, ...headers };

        const url = `${this.session.url}/metadata/${this.identifier}`;
        // TODO: currently files and metadata targets do not support dict's,
        // but they might someday?? refactor this check.
        const sourceMetadata = this.itemData;
        const request = new IaMetadataRequest(url, {
            // TODO
            headers,
            metadata,
            sourceMetadata,
            target,
            priority,
            append,
            appendList,
            insert
        });
        // Must use Session.prepare_request to make sure session settings
        // are used on request!
        if (debug)
            return request;
        const response = await this.session.send(request);
        // Re-initialize the Item object with the updated metadata.
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        this.refresh();
        return response;
    }

    /**
     * Remove item from a simplelist.
     * @param parent 
     * @param list 
     * @returns 
     */
    public async removeFromSimplelist(parent: string, list: string): Promise<Response> {
        const patch = {
            op: 'delete',
            parent: parent,
            list: list,
        };
        const json = {
            '-patch': JSON.stringify(patch),
            '-target': 'simplelists',
        };
        const response = await this.session.post(this.urls.metadata, { json });
        if (!response.ok) {
            throw await handleIaApiError(response);
        }
        return response;
    }


    /**
     * Upload a single file to an item. The item will be created if it does not exist.
     * 
     * @example
     * import { IaItem } from 'internetarchive-ts';
     * const item = Item('identifier');
     * item.uploadFile('/path/to/image.jpg',{key:'photos/image1.jpg'})
     * 
     * @param _body File or data to be uploaded. Filepath or file-like object.
     * @param options 
     * @param options.key Remote filename.
     * @param options.metadata Metadata used to create a new item.
     * @param options.fileMetadata File-level metadata to add to the files.xml entry for the file being uploaded.
     * @param options.headers Add additional IA-S3 headers to request.
     * @param options.accessKey
     * @param options.secretKey
     * @param options.queueDerive Set to false to prevent an item from being derived after upload.
     * @param options.verbose Print progress to stdout.
     * @param options.verify Verify local MD5 checksum matches the MD5 checksum of the file received by IAS3.
     * @param options.checksum Skip based on checksum.
     * @param options.deleteLocalFile Delete local file after the upload has been successfully verified.
     * @param options.retries Number of times to retry the given request if S3 returns a 503 SlowDown error.
     * @param options.retriesSleep Amount of time to sleep between retries.
     * @param options.debug Set to true to print headers to stdout, and exit without sending the upload request.
     * @param options.validateIdentifier Set to true to validate the identifier before uploading the file.
     * @returns 
     */
    public async uploadFile<M extends IaBaseMetadataType = IaBaseMetadataType, F extends IaFileBaseMetadata = IaFileBaseMetadata>(
        body: string | Buffer | Blob,
        {
            key,
            metadata,
            fileMetadata,
            headers = {},
            queueDerive = false,
            verbose = false,
            verify = false,
            checksum = false,
            retries = 0,
            retriesSleep = 30,
            debug = false,
        }: IaItemUploadFileParams<M, F>): Promise<any> {

        let md5Sum = undefined;

        const _headers: HttpHeaders = { ...headers };
        const _body = typeof (body) === "string" ? readStreamToReadableStream(createReadStream(body, { encoding: 'binary' })) : body;

        const filename = typeof (body) === "string" ? body : undefined;

        // TODO: How to handle input streams where size isn't known
        const size = filename ? getFileSize(filename) : undefined;

        // Support for uploading empty files.
        if (size == 0) {
            _headers['Content-Length'] = '0';
        }

        if (!_headers['x-archive-size-hint'] && size) {
            _headers['x-archive-size-hint'] = `${size}`;
        }

        if (!key) {
            if (filename) {
                key = key ?? path.basename(filename);
            } else {
                throw new IaTypeError(`Either filename or key must be defined`);
            }
        }

        const baseUrl = `${this.session.protocol}//s3.us.archive.org/${this.identifier}`;
        const url = `${baseUrl}/${encodeURIComponent(lstrip(normFilepath(key), "/"))}`;

        // Skip based on checksum.
        if (checksum) {
            md5Sum = await this.getMd5(body);
            const iaFile = this.getFile(key);
            if (!this.tasks && iaFile && iaFile.md5 == md5Sum) {
                log.info(`${key} already exists: ${url}, skipping`);
                // Return an empty response object if checksums match.
                // TODO: Is there a better way to handle this?
                return new Response();
            }
        }

        if (verify) {
            if (!md5Sum) {
                md5Sum = await getMd5(body);
            }
            _headers['Content-MD5'] = md5Sum;
        }

        const buildRequest = () => {
            const data = _body;
            return new S3Request(url, {
                method: 'PUT',
                headers,
                auth: this.session.auth,
                body: _body,
                metadata,
                fileMetadata,
                queueDerive
            });
        };


        //if (debug) {
        //    const request = buildRequest();
        //    _body.close();
        //    return request;
        //}


        while (true) {
            let request: Request | undefined;
            try {
                if (retries > 0) {
                    if (await this.session.s3IsOverloaded()) {
                        log.warning(`s3 is overloaded, sleeping for ${retriesSleep} seconds and retrying. ${retries} retries left.`);
                        await sleepMs(retriesSleep);
                        retries --;
                        continue;
                    }
                }
                request = buildRequest();

                // chunked transfer-encoding is NOT supported by IA-S3.
                // It should NEVER be set. Requests adds it in certain
                // scenarios (e.g. if content-length is 0). Stop it.
                if (request.headers.get('transfer-encoding') === 'chunked') {
                    request.headers.delete('transfer-encoding');
                }
                const response = await this.session.send(request, { stream: true });
                if ((response.status == 503) && (retries > 0)) {
                    const text = await response.text();
                    if (text.includes('appears to be spam')) {
                        // TODO 503 error obj
                        log.error('detected as spam, upload failed');
                        break;
                    }
                    log.info(`s3 is overloaded, sleeping for ${retriesSleep} seconds and retrying. ${retries} retries left.`);
                    await sleepMs(retriesSleep);
                    retries --;
                    continue;
                }
                if (response.ok) {
                    log.info(`uploaded ${key} to ${url}`);
                    return response;
                } else {
                    if (response.status == 503) {
                        throw new IaApiServiceUnavailableError(`Could not upload file, service unavailable`, { request, response });
                    }
                    throw await handleIaApiError(response, request);
                }
            } catch (err) {
                let msg: string;
                if (err instanceof IaApiError) {
                    msg = getS3XmlText(await err.response?.text()) ??
                        `IA S3 returned invalid XML (HTTP status code ${err.status}).` +
                        `This is a server side error which is either temporary, or requires the intervention of IA admins.`;
                }

                msg = ('IA S3 returned invalid XML (HTTP status code {exc.response.statusCode}). This is a server side error which is either temporary, or requires the intervention of IA admins.');

                const errorMsg = ` error uploading ${key} to ${this.identifier}, ${msg}`;
                log.error(errorMsg);
                if (verbose)
                    console.error(` error uploading ${key}: ${msg}`);
                // Raise HTTPError with error message.
                //throw type(exc)(errorMsg, response=exc.response, request=exc.request)
                throw new IaApiFileUploadError(errorMsg, { request });
            } finally {
                //_body.close();
            }
        }
    }

    // TODO fix examples
    /**
     * Upload files to an item. The item will be created if it
     * does not exist.
     * 
     * @example
     * 
     * import {IaItem} from "internetarchive-ts";
     * const item = new IaItem('identifier');
     * const metadata = {'mediatype': 'image', 'creator': 'Jake Johnson'}
     * item.upload('/path/to/image.jpg', {metadata, queueDerive: false})
     * // [<Response [200]>]
     * 
     * @example // Uploading multiple files
     * 
     * const r1 = item.upload(['file1.txt', 'file2.txt']);
     * const r2 = item.upload([fileobj, fileobj2]);
     * const r3 = item.upload(('file1.txt', 'file2.txt'));
     * 
     * @example // Uploading file objects
     * 
     * const f = Buffer.from("some data");
     * const r = item.upload({'remote-name.txt': f});
     * 
     * @example // Setting the remote filename with an object
     * 
     * const r = item.upload({'remote-name.txt': '/path/to/local/file.txt'})
     * 
     * @param files 
     * @param param1
     * @param param1.metadata
     * @param param1.headers
     * @param param1.accessKey
     * @param param1.secretKey
     * @param param1.queueDerive
     * @param param1.verbose
     * @param param1.verify
     * @param param1.checksum
     * @param param1.deleteLocalFiles
     * @param param1.retries
     * @param param1.retriesSleep
     * @param param1.debug
     * @param param1.validateIdentifier
     * @returns 
     */
    /*public async upload(files: IaFileObject | IaFileObject[] | string | string[], {
        metadata,
        headers,
        accessKey,
        secretKey,
        queueDerive = true,
        verbose = false,
        verify = false,
        checksum = false,
        deleteLocalFiles = false,
        retries,
        retriesSleep,
        debug = false,
        validateIdentifier = false,
    }: IaItemUploadParams): Promise<Request[] | Response[]> {
        let remoteDirName = undefined;
        const _files = makeArray(files);

        if (_files.every(isIaFileObject)) {

        }

        let responses: Response[] = [];
        let fileIndex = 0;


        let totalFiles = 0;

        if (queueDerive && totalFiles == 0) {
            const checksums = this.files.map(f => f.md5);
            if (checksum) {
                totalFiles = recursiveFileCount(_files, checksums);
            } else {
                totalFiles = recursiveFileCount(_files);
            }
        }

        let fileMetadata: any = undefined;

        for (let f of _files) {
            if (isIaFileObject(f)) {
                if (f.name) {
                    fileMetadata = { ...f };
                    delete fileMetadata.name;
                    f = f.name;
                }
            }
            if (typeof (f) === "string" && statSync(f).isDirectory()) {
                for await (const entry of recursiveIterDirectoryWithKeys(f)) {
                    let [filePath, key] = entry;
                    fileIndex += 1;
                    // Set derive header if queueDerive is True,
                    // and this is the last request being made.
                    let _queueDerive = (queueDerive == true && fileIndex >= totalFiles);


                    if (!f.endsWith('/')) {
                        if (remoteDirName) {
                            key = `${remoteDirName}${f}/${key}`;
                        } else {
                            key = `${f}/${key}`;
                        }
                    } else if (remoteDirName) {
                        key = `${remoteDirName}/${key}`;
                    }
                    key = normFilepath(key);
                    let resp = this.uploadFile(filePath, {
                        key,
                        metadata,
                        fileMetadata,
                        headers,
                        accessKey,
                        secretKey,
                        _queueDerive,
                        verbose,
                        verify,
                        checksum,
                        deleteLocalFiles,
                        retries,
                        retriesSleep,
                        debug,
                        validateIdentifier
                    });
                    responses.push(resp);
                }
            } else {
                fileIndex += 1;
                // Set derive header if queueDerive is True,
                // and this is the last request being made.
                // if queueDerive is True and fileIndex >= len(files):
                const _queueDerive = (queueDerive && fileIndex >= totalFiles);
                if (!isinstance(f, (list, tuple))) {:
                    key, body = (None, f);
                } else {
                    key, body = f;
                }
                if (key && !isinstance(key, str)) {
                    key = str(key);
                }
                const response = this.uploadFile(body, {
                    key,
                    metadata,
                    fileMetadata,
                    headers,
                    accessKey,
                    secretKey,
                    queueDerive: _queueDerive,
                    verbose,
                    verify,
                    checksum,
                    deleteLocalFile: deleteLocalFiles,
                    retries,
                    retriesSleep,
                    debug,
                    validateIdentifier
                });
                responses.push(response);
            }
        }
        return responses;
    }*/
}

function getS3XmlText(arg0: string | undefined): string {
    throw new Error("Function not implemented.");
}

