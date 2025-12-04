import { createReadStream, statSync } from "fs";
import path from "path";

import log from "../log";
import IaSession from "../session/IaSession";
import IaCatalogTask from "../catalog/IaCatalogTask";
import S3Request from "../request/S3Request";
import {
    getMd5,
    lstrip,
    makeArray,
    recursiveFileCount,
    recursiveIterDirectoryWithKeys,
    sleepMs
} from "../util";
import {
    IaApiJsonResult,
    IaBaseMetadataType,
    IaFileBaseMetadata,
    IaFileObject,
    IaFileSourceMetadata,
    IaFixerData,
    IaGetTasksBasicParams,
    IaGetTasksParams,
    IaItemData,
    IaItemPostReviewBody,
    IaItemReview,
    IaItemUrls,
    isIaFileObject,
    HttpHeaders,
    HttpParams,
    IA_ITEM_URL_TYPES,
    IaFixerOp,
    IaItemDeleteReviewParams,
    IaItemUrlType
} from "../types";
import { IaTaskPriority, IaTaskSummary } from "../types/IaTask";
import { IaItemDownloadParams, IaItemGetFilesParams, IaItemModifyMetadataParams, IaItemUploadFileParams, IaItemUploadParams } from "../types/IaParams";
import { IaBaseItem } from "./IaBaseItem";

import { handleIaApiError } from "../util/handleIaApiError";
import { patternsMatch } from "../util/patternsMatch";
import { getFileSize } from "../util/getFileSize";
import { normFilepath } from "../util/normFilePath";
import { getApiResultValue } from "../util/getApiResultValue";
import { readStreamToReadableStream } from "../util/readStreamToReadableStream";

import { IaMetadataRequest } from "../request/IaMetadataRequest";
import { IaFile } from "../files";
import {
    IaApiError,
    IaApiFileUploadError,
    IaApiServiceUnavailableError,
    IaApiSpamError,
    IaTypeError
} from "../error";
import { IaLongViewCountItem, IaShortViewCountItem } from "../types/IaViewCount";

/** 
 * This class represents an archive.org item. Generally this class
 * should not be used directly, but rather via the
 * {@link IaSession.getItem} function.
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
 * import getItem from "internetarchive-ts";
 * const metadata = {title: 'The Stairs'};
 * await item.modifyMetadata(metadata);
 * console.log(item.metadata.title) // 'The Stairs'
 * 
 * @example // Upload
 * await item.upload('myfile.tar') // true
 */
export class IaItem<
    ItemMetaType extends IaBaseMetadataType = IaBaseMetadataType,
    ItemFileMetaType extends IaBaseMetadataType = IaBaseMetadataType
> extends IaBaseItem<ItemMetaType, ItemFileMetaType> {
    public static getMd5: ((body: Blob | string | Buffer) => Promise<string>) = getMd5;

    /** A copyable link to the item, in MediaWiki format */
    public readonly wikilink?: string;
    static readonly DEFAULT_URL_FORMAT = (item: IaItem, path: string) => `${item.session.url}/${path}/${item.identifier}`;

    /** Item URL types */
    public readonly urls: IaItemUrls;
    /** Session that this Instance uses to access the API */
    public readonly session: IaSession;

    private getMd5: ((body: Blob | string | Buffer) => Promise<string>) = IaItem.getMd5;

    /**
     * 
     * @param archiveSession 
     * @param identifier The globally unique Archive.org identifier for this item.
     *     
     *                   An identifier is composed of any unique combination of
     *                   alphanumeric characters, underscore (`_`) and dash (`-`).While
     *                   there are no official limits it is strongly suggested that they
     *                   be between 5 and 80 characters in length. Identifiers must be
     *                   unique across the entirety of Internet Archive, not simply
     *                   unique within a single collection.
     *                   
     *                   Once defined an identifier can not be changed. It will travel
     *                   with the item or object and is involved in every manner of
     *                   accessing or referring to the item.
     * 
     * @param itemMetadata The Archive.org item metadata used to initialize this item.
     */
    public constructor(
        archiveSession: IaSession,
        itemData: IaItemData<ItemMetaType, ItemFileMetaType>,
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

    protected makeURL<Path extends IaItemUrlType>(path: Path, urlFormat: ((itm: IaItem<any, any>, path: string) => string) = IaItem.DEFAULT_URL_FORMAT): string {
        return urlFormat(this, path);
    }

    public get paths(): Readonly<typeof IA_ITEM_URL_TYPES> {
        return IA_ITEM_URL_TYPES;
    }

    /**
     * 
     * @param itemMetadata 
     */
    public async refresh(itemMetadata?: IaItemData<ItemMetaType, ItemFileMetaType>): Promise<void> {
        this.load(itemMetadata ?? await this.session.getMetadata(this.identifier) as IaItemData<ItemMetaType, ItemFileMetaType>);
    }

    /**
     * Get a summary of the item's pending tasks.
     * @param params Params to send with your request.
     * @returns A summary of the item's pending tasks.
     */
    public getTasksSummary(params?: Omit<IaGetTasksParams, 'identifier'>): Promise<IaTaskSummary> {
        return this.session.getTasksSummary(this.identifier, params);
    }

    /**
     * Check if there is any pending task for the item.
     * @param params Params to send with your request.
     * @returns true if tasks are pending, otherwise false.
     */
    public async hasTasksPending(params?: Omit<IaGetTasksParams, 'identifier'>): Promise<boolean> {
        const taskSummaries = await this.getTasksSummary(params);
        return !Object.values(taskSummaries).every(t => t == 0);
    }

    /**
     * Get a list of all tasks for the item, pending and complete.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns A list of all tasks for the item, pending and complete.
     */
    public getAllItemTasks(params: Omit<IaGetTasksParams, 'identifier' | 'catalog' | 'history'> = {}): Promise<IaCatalogTask[]> {
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
    public async getTaskHistory(params?: IaGetTasksBasicParams): Promise<IaCatalogTask[]> {
        return Array.fromAsync(this.session.iterTaskHistory(this.identifier, params));
    }

    /**
     * Get a list of pending catalog tasks for the item.
     * @param params Params to send with your request.
     * @returns A list of pending catalog tasks for the item.
     */
    public async getCatalogTasks(params?: IaGetTasksBasicParams): Promise<IaCatalogTask[]> {
        return Array.fromAsync(this.session.iterCatalogTasks(this.identifier, params));
    }

    /**
     * Derive an item.
     * @param priority Task priority from `10` to `-10` (default: `0`)
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
     * @param args Additional optional args 
     * @param headers Additional optional headers
     * @returns 
     */
    public async derive(
        priority: IaTaskPriority = 0,
        removeDerived?: string,
        reducedPriority: boolean = false,
        args: Record<string, any> = {},
        headers?: HttpHeaders
    ): Promise<Response> {
        if (removeDerived) {
            args.removeDerived = removeDerived;
        }
        const response = await this.session.submitTask(
            this.identifier,
            'derive.php',
            {
                comment: '',
                priority,
                args,
                headers,
                reducedPriority
            });
        if (!response.ok) {
            throw await handleIaApiError({ response });
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
        const operations: IaFixerOp[] = makeArray(ops);
        data.args ??= {};
        for (let op of operations) {
            data.args[op] = '1';
        }

        const response = await this.session.submitTask(
            this.identifier,
            'fixer.php',
            {
                comment: '',
                priority,
                args: data.args,
                headers,
                reducedPriority
            });
        if (!response.ok) {
            throw await handleIaApiError({ response });
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
     *        `priority` in that it will allow you to possibly
     *        avoid rate-limiting.
     * @param args Additional arguments to submit with the task.
     * @returns TODO
     */
    public async undark(
        comment: string,
        priority: IaTaskPriority = 0,
        reducedPriority: boolean = false,
        args?: Record<string, any>
    ): Promise<Response> {
        const response = await this.session.submitTask(
            this.identifier,
            'make_undark.php',
            {
                comment,
                priority,
                args,
                reducedPriority
            });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        return response; // TODO process response
    }

    /**
     * Dark the item.
     * @param comment The curation comment explaining reason for darking item
     * @param priority The task priority.
     * @param reducedPriority Submit your derive at a lower priority.
     *        This option is helpful to get around rate-limiting.
     *        Your task will more likely be accepted, but it might
     *        not run for a long time. Note that you still may be
     *        subject to rate-limiting. This is different than
     *        `priority` in that it will allow you to possibly
     *        avoid rate-limiting.
     * @param args Additional arguments to submit with the task.
     * @returns TODO
     */
    public async dark(comment: string, priority: IaTaskPriority = 0, reducedPriority: boolean = false, args?: Record<string, any>): Promise<Response> {
        const response = await this.session.submitTask(
            this.identifier,
            'make_dark.php',
            {
                comment,
                priority,
                args,
                reducedPriority
            });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        return response; // TODO process response
    }

    /**
     * Retrieves the currently authenticated user's review (if existing) for the this item.
     * An item can only have one review for each user. If there is no review, this method returns undefined.
     * @returns The review, or undefined if there is no review
     * @throws {IaApiError} If unexpected HTTP response is returned
     * @throws {IaApiUnauthorizedError} If the user does not have permissions for this call or is not authenticated
     * @throws {IaApiNotFoundError} If there are no reviews by the user that is making this request
     */
    public async getReview(): Promise<IaItemReview | undefined> {
        const url = `${this.session.url}/services/reviews.php`;
        const params = { identifier: this.identifier };
        const response = await this.session.get(url, { params });
        if (!response.ok) {
            // If there exists no review for this item for authenticated user, return undefined
            if (response.status === 404 && response.headers.get("content-type") === "application/json") {
                return undefined;
            }
            throw await handleIaApiError({ response });
        }
        const json = await response.json() as IaApiJsonResult<IaItemReview>;
        return json.value;
    }

    /**
     * Delete a review from the item
     * @param username 
     * @param screenname 
     * @param itemname 
     * @returns 
     */
    public async deleteReview(data: IaItemDeleteReviewParams): Promise<any> {
        const url = `${this.session.url}/services/reviews.php`;
        const params = { identifier: this.identifier };
        const response = await this.session.delete(url, { params, json: data });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        return getApiResultValue<any>(response);
    }

    /**
     * Add a review to an item
     * @param param0.title Review title
     * @param param0.body Review body
     * @param param0.stars amount of stars (0-5)
     * @returns 
     */
    public async review(review: IaItemPostReviewBody): Promise<Response> {
        const url = `${this.session.url}/services/reviews.php`;
        const params: HttpParams = { identifier: this.identifier };
        const response = await this.session.post(url, { params, json: review });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        return response;
    }

    /**
     * Get a {@link IaFile} object for the named file.
     * @param fileName 
     * @param fileMetadata metadata for the given file.
     * @returns 
     */
    public getFile(fileName: string, fileMetadata: IaFileSourceMetadata<ItemFileMetaType>): IaFile<ItemFileMetaType> {
        return new IaFile<ItemFileMetaType>(this, fileMetadata);
    }

    /**
     * 
     * @param param0 options
     * @param param0.formats Formats
     * @param param0.globPattern GlobPattern
     * @param param0.excludePattern Exclude PAttern
     * @param param0.onTheFly on the fly
     */
    public *getFiles(
        {
            files = [],
            formats = [],
            globPattern = [],
            excludePattern = [],
            onTheFly = false
        }: IaItemGetFilesParams): Generator<IaFile<ItemFileMetaType>> {
        files = makeArray(files);
        formats = makeArray(formats);
        globPattern = makeArray(globPattern);
        excludePattern = makeArray(excludePattern);

        const itemFiles = [...this.files];
        // Add support for on-the-fly files (e.g. EPUB).

        // TODO make sure otf is still applicable
        /*if (onTheFly) {
            const otfFiles: [string, string][] = [
                ['EPUB', `${this.identifier}.epub`],
                ['MOBI', `${this.identifier}.mobi`],
                ['DAISY', `${this.identifier}_daisy.zip`],
                ['MARCXML', `${this.identifier}_archive_marc.xml`],
            ];
            for (let [format, name] of otfFiles) {
                itemFiles.push({ name, format, otf: true });
            }
        }*/

        // If no filters are defined, simply return all files
        if (!files?.length && !formats.length && !globPattern.length) {
            for (let f of itemFiles) {
                yield new IaFile<ItemFileMetaType>(this, f);
            }
        } else {
            for (let f of itemFiles) {
                const format = typeof f.format === "string" && f.format;
                if (files.includes(f.name)) {
                    yield new IaFile<ItemFileMetaType>(this, f);
                } else if (format && formats.includes(format)) {
                    yield new IaFile<ItemFileMetaType>(this, f);
                } else if (globPattern.length || excludePattern.length) {
                    if (patternsMatch(f.name, globPattern)) { // Will return true if globPattern is empty
                        if (excludePattern.length && patternsMatch(f.name, excludePattern)) {
                            continue;
                        }
                        yield new IaFile<ItemFileMetaType>(this, f);
                    }
                }
            }
        }
    }

    /**
     * Download a file
     * @param param0 Download file parameters
     * @param param0.files Only download files matching given file names.
     * @param param0.formats Only download files matching the given Formats.
     * @param param0.globPattern Only download files matching the given glob pattern.
     * @param param0.excludePattern Exclude files whose filename matches the given glob pattern.
     * @param param0.dryRun Output download URLs to stdout, don't download anything.
     * @param param0.verbose Turn on verbose output.
     * @param param0.ignoreExisting Skip files that already exist locally.
     * @param param0.checksum Skip downloading file based on checksum.
     * @param param0.destdir The directory to download files to.
     * @param param0.noDirectory Download files to current working directory rather than creating an item directory.
     * @param param0.retries The number of times to retry on failed requests.
     * @param param0.itemIndex The index of the item for displaying progress in bulk downloads.
     * @param param0.ignoreErrors Don't fail if a single file fails to download, continue to download other files.
     * @param param0.onTheFly Download on-the-fly files (i.e. derivative EPUB, MOBI, DAISY files).
     * @param param0.returnResponses Rather than downloading files to disk, return a list of response objects.
     * @param param0.noChangeTimestamp If true, leave the time stamp as the current time instead of changing it to that given in the original archive.
     * @param param0.ignoreHistoryDir Do not download any files from the history dir. This param defaults to ``false``.
     * @param param0.source Filter files based on their source value in files.xml (i.e. `original`, `derivative`, `metadata`).
     * @param param0.excludeSource Filter files based on their source value in files.xml (i.e. `original`, `derivative`, `metadata`).
     * @param param0.stdout 
     * @param param0.params URL parameters to send with download request (e.g. `cnt=0`).
     * @param param0.timeout 
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
            source,
            excludeSource,
            params,
            timeout = 120
        }: IaItemDownloadParams = {}
    ): Promise<Response[] | string[]> {

        const sources = source && makeArray(source);
        const excludeSources = excludeSource && makeArray(excludeSource);

        let fileobj: any;


        if (dryRun) {
            if (itemIndex && verbose) {
                console.error(`${this.identifier} (${itemIndex}):`);
            } else if (!itemIndex && verbose) {
                console.error(`${this.identifier}:`);
            }
        }

        if (this.is_dark) {
            log.warning(`Skipping ${this.identifier}, item is dark`);
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

        let errors: string[] = [];
        let downloaded = 0;
        let responses: Response[] = [];
        let fileCount = 0;

        for (let file of gFiles) {
            if (ignoreHistoryDir) {
                if (file.name.startsWith('history/')) {
                    log.verbose(`Skipped file "${file.name}" because it is history dir"`);
                    continue;
                }
            }
            if (sources && !sources.includes(file.source)) {
                log.verbose(`Skipped file "${file.name}" because it is not in sources"`);
                continue;
            } else if (excludeSources && excludeSources.includes(file.source)) {
                log.verbose(`Skipped file "${file.name}" because it is not in excludeSources"`);
                continue;
            }
            fileCount++;
            let target = noDirectory ? file.name : path.join(this.identifier, file.name);
            if (dryRun) {
                log.info(`[DRYRUN] Downloading ${file.url}`);
                continue;
            }
            const response = await file.download({
                ignoreExisting,
                checksum,
                destdir,
                retries,
                ignoreErrors,
                target,
                returnResponses,
                noChangeTimestamp,
                params,
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
                log.info(`Skipping ${this.identifier}, no matching files found.`);
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
     * {@link https://tools.ietf.org/html/draft-ietf-appsawg-json-patch-02 | JSON Patch version 02}
     * 
     * @example
     * ```typescript
     * import {IaItem} from 'internetarchive-ts';
     * const item = new IaItem('mapi_test_item1');
     * const md = {'new_key': 'new_value', 'foo': ['bar', 'bar2']};
     * item.modifyMetadata(md);
     * ```
     * 
     * @param metadata Metadata used to update the item.
     * @param param1.target Set the metadata target to update.
     * @param param1.append Append value to an existing multi-value metadata field.
     * @param param1.appendList Append values to an existing multi-value metadata field. No duplicate values will be added.
     * @param param1.insert 
     * @param param1.priority Set task priority.
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
        headers = {},
    }: IaItemModifyMetadataParams): Promise<Request | Response> {
        headers = { ...this.session.headers, ...headers };

        const url = `${this.session.url}/metadata/${this.identifier}`;
        // TODO currently files and metadata targets do not support dict's, but they might someday? refactor this check.
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
        const response = await this.session.send(request);
        if (!response.ok) {
            throw await handleIaApiError({ request, response });
        }
        await this.refresh();
        return response;
    }

    /**
     * Remove this item from a simplelist
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
            throw await handleIaApiError({ response });
        }
        return response;
    }

    /**
     * Get long view counts
     * @returns long view counts for this object
     */
    public getLongViewCounts(): Promise<IaLongViewCountItem> {
        return this.session.getLongViewcounts([this.identifier])
            .then(result => result.ids[this.identifier]);
    }

    /**
     * Get short view counts
     * @returns short view counts for this object
     */
    public getShortViewCounts(): Promise<IaShortViewCountItem> {
        return this.session.getShortViewcounts([this.identifier])
            .then(result => result[this.identifier]);
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

        function getReadable(body: string | Buffer | Blob): ReadableStream | Buffer | Blob {
            return typeof (body) === "string" ? readStreamToReadableStream(createReadStream(body, { encoding: 'binary' })) : body;
        }
        const _body = getReadable(body);

        const filename = typeof (body) === "string" ? body : undefined;

        // TODO: How to handle input streams where size isn't known
        const size = filename ? getFileSize(filename) : undefined;

        // Support for uploading empty files.
        if (size === 0) {
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
            //const iaFile = this.getFile(key);
            //if (!this.tasks && iaFile && iaFile.md5 == md5Sum) {
            //    log.info(`${key} already exists: ${url}, skipping`);
            //    // Return an empty response object if checksums match.
            //    // TODO: Is there a better way to handle this?
            //    return new Response();
            //}
        }

        if (verify) {
            if (!md5Sum) {
                md5Sum = await getMd5(body);
            }
            _headers['Content-MD5'] = md5Sum;
        }

        const buildRequest = () => new S3Request(url, {
            method: 'PUT',
            headers,
            auth: this.session.auth,
            // TODO fix/test
            body: _body as any,
            metadata,
            fileMetadata,
            queueDerive
        });



        if (debug) {
            const request = buildRequest();
            //_body.close();
            return request;
        }


        do {
            let request: Request | undefined;
            try {
                if (retries > 0) {
                    if (await this.session.s3IsOverloaded()) {
                        log.warning(`s3 is overloaded, sleeping for ${retriesSleep} seconds and retrying. ${retries} retries left.`);
                        await sleepMs(retriesSleep);
                        retries--;
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
                const response = await this.session.send(request);
                if ((response.status == 503) && (retries > 0)) {
                    const text = await response.text();
                    if (text.includes('appears to be spam')) {
                        log.error('detected as spam, upload failed');
                        throw new IaApiSpamError(text, { response, request });
                    }
                    log.info(`s3 is overloaded, sleeping for ${retriesSleep} seconds and retrying. ${retries} retries left.`);
                    await sleepMs(retriesSleep);
                    retries--;
                    continue;
                }
                if (response.ok) {
                    log.info(`uploaded ${key} to ${url}`);
                    return response;
                } else {
                    if (response.status == 503) {
                        throw new IaApiServiceUnavailableError(`Could not upload file, service unavailable`, { request, response });
                    }
                    throw await handleIaApiError({ response, request });
                }
            } catch (err: any) {
                let msg: string = err.message;
                if (err instanceof IaApiError) {
                    msg = getS3XmlText(await err.response?.text()) ??
                        `IA S3 returned invalid XML (HTTP status code ${err.status}).` +
                        `This is a server side error which is either temporary, or requires the intervention of IA admins.`;
                }
                const errorMsg = `Error uploading ${key} to ${this.identifier}, ${msg}`;
                log.error(errorMsg);
                throw new IaApiFileUploadError(errorMsg, { request, response: err.response });
            } finally {
                //_body.close();
            }
        } while (retries > 0);
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
     * const r = item.upload({name: 'remote-name.txt', fileData: f});
     * 
     * @example // Setting the remote filename with an object
     * 
     * const r = item.upload({name: 'remote-name.txt', fileData: '/path/to/local/file.txt'})
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
    public async upload(files: IaFileObject | IaFileObject[] | string | string[], {
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

        //if (_files.every(isIaFileObject)) {
        //
        //}

        const fileNames = _files.map(file => isIaFileObject(file) ? file.name : file);

        let responses: Response[] = [];
        let fileIndex = 0;


        let totalFiles = 0;

        if (queueDerive && totalFiles == 0) {
            const checksums = this.files.map(f => f.md5);
            if (checksum) {
                totalFiles = await recursiveFileCount(fileNames, checksums);
            } else {
                totalFiles = await recursiveFileCount(fileNames);
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
                    queueDerive = (queueDerive == true && fileIndex >= totalFiles);


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
                    let resp = await this.uploadFile(filePath, {
                        key,
                        metadata,
                        fileMetadata,
                        headers,
                        accessKey,
                        secretKey,
                        queueDerive,
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
                queueDerive = (queueDerive && fileIndex >= totalFiles);
                let key;
                let body;
                if (isIaFileObject(f)) {
                    key = f.name;
                    body = f.fileData;
                } else {
                    key = path.basename(f);
                    body = f;
                }
                const response = await this.uploadFile(body, {
                    key,
                    metadata,
                    fileMetadata,
                    headers,
                    accessKey,
                    secretKey,
                    queueDerive,
                    verbose,
                    verify,
                    checksum,
                    deleteLocalFiles,
                    retries,
                    retriesSleep,
                    debug,
                    validateIdentifier
                });
                responses.push(response);
            }
        }
        return responses;
    }
}

function getS3XmlText(arg0: string | undefined): string {
    throw new Error("Function not implemented.");
}


