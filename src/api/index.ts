import CatalogTask from "../catalog/CatalogTask";
import { IaApiaAuthenticationError } from "../error";
import { IaFile } from "../files";
import { IaItem } from "../item/IaItem";
import { IaSearch } from "../search/IaSearch";
import IaSession from "../session/IaSession";
import {
    IaAuthConfig,
    IaGetItemParams,
    IaFileBaseMetadata,
    IaGetFilesParams,
    IaItemMetadata,
    DebugDisabled,
    IaModifyMetadataParams,
    DebugEnabled,
    IaItemDownloadParams,
    IaDeleteItemParams,
    IaGetSessionParams,
    IaGetTasksParams,
    IaSearchItemsParams,
    IaUserInfo,
    IaFileObject,
    IaUploadParams,
} from "../types";
import { createS3AuthHeader } from "../util/createS3AuthHeader";
import { handleIaApiError } from "../util/handleIaApiError";

/**
 * Return a new {@link IaSession} object. The {@link IaSession}
 * object is the main interface to the internetarchive library. It allows you to
 * persist certain parameters across tasks.
 * 
 * @example
 * import { getSession}  from 'internetarchive';
 * config = {'s3': {'access': 'foo', 'secret': 'bar'}};
 * s = getSession(config);
 * s.accessKey;
 * 'foo'
 * 
 * // From the session object, you can access all of the functionality of the internetarchive lib
 * item = s.getItem('nasa');
 * item.download();
 * // nasa: success
 * s.getTasks({taskIds:[31643513]})[0].server
 * 
 * @param config A dictionary used to configure your session.
 * @param configFile A path to a config file used to configure your session.
 * @param debug To be passed on to this session's method calls.
 * @param httpAdapterKwargs Keyword arguments that `requests.adapters.HTTPAdapter` takes.
 * @returns a new ArchiveSession object
 */
export function getSession(config?: IaAuthConfig, debug: boolean = false): IaSession {
    return new IaSession(config);
}

/**
 * Get an {@link IaItem} object.
 * 
 * @example
 * import getItem from 'internetarchive';
 * item = getItem('nasa');
 * item.itemSize;
 * 121084
 * 
 * @param identifier The globally unique Archive.org item identifier.
 * @param param1 
 * @param param1.config A dictionary used to configure your session.
 * @param param1.configFile A path to a config file used to configure your session.
 * @param param1.archiveSession An {@link IaSession} object.
 * @param param1.debug To be passed on to getSession(). 
 * @returns The Item that fits the criteria.
 */
export function getItem(
    identifier: string,
    {
        config,
        archiveSession,
        debug = false
    }: IaGetItemParams = {}): Promise<IaItem> {
    archiveSession = archiveSession ?? getSession(config, debug);
    return archiveSession.getItem(identifier);
}

/**
 * Get {@link IaFile} objects from an item.
 * 
 * @example
 * import {getFiles} from "internetarchive-ts";
 * let fnames = (await getFiles('nasa', {globPattern:'*xml'})).map(f => f.name)
 * ['nasa_reviews.xml', 'nasa_meta.xml', 'nasa_files.xml']
 * 
 * @param identifier The globally unique Archive.org identifier for a given item.
 * @param params
 * @param params.files Only return files matching the given filenames.
 * @param params.formats Only return files matching the given formats.
 * @param params.globPattern Only return files matching the given glob pattern.
 * @param params.excludePattern Exclude files matching the given glob pattern.
 * @param params.onTheFly Include on-the-fly files (i.e. derivative EPUB)
 * @returns Files from an item.
 */
export async function getFiles<IaFileMeta extends IaFileBaseMetadata = IaFileBaseMetadata>(
    identifier: string,
    params: IaGetFilesParams
): Promise<Generator<IaFile<IaFileMeta>>> {
    const item = await getItem(identifier, params);
    return item.getFiles(params);
}

/**
 * Modify the metadata of an existing item on Archive.org.
 * @param identifier The globally unique Archive.org identifier for a given item.
 * @param metadata Metadata used to update the item.
 * @param params
 * @param params.target The metadata target to update. Defaults to `metadata`.
 * @param params.append set to True to append metadata values to current values
 * @param params.appendList Append values to an existing multi-value
 * @param params.priority Set task priority.
 * @param params.accessKey IA-S3 accessKey to use when making the given request.
 * @param params.secretKey IA-S3 secretKey to use when making the given request.
 * @param params.debug set to `true` to return a Request
 * @returns A Request if debug else a Response.
 */
export function modifyMetadata(identifier: string, metadata: IaItemMetadata, params: DebugDisabled<IaModifyMetadataParams>): Promise<Request>;
export function modifyMetadata(identifier: string, metadata: IaItemMetadata, params: DebugEnabled<IaModifyMetadataParams>): Promise<Response>;
export function modifyMetadata(identifier: string, metadata: IaItemMetadata, params: IaModifyMetadataParams): Promise<Request | Response> {
    return getItem(identifier, params)
        .then(item => item.modifyMetadata(metadata, params));
}


/**
 * Upload files to an item. The item will be created if it does not exist.
 * @param identifier The globally unique Archive.org identifier for a given item.
 * @param files The filepaths or file-like objects to upload. This value can be an iterable or a single file-like object or string.
 * @param metadata Metadata used to create a new item. If the item already exists, the metadata will not be updated -- use ``modify_metadata``.
 * @param params Parameters for {@link IaItem.upload}.
 * @param params.headers Add additional HTTP headers to the request.
 * @param params.accessKey IA-S3 accessKey to use when making the given request.
 * @param params.secretKey IA-S3 secretKey to use when making the given request.
 * @param params.queueDerive Set to false to prevent an item from being derived after upload.
 * @param params.verbose Display upload progress.
 * @param params.verify Verify local MD5 checksum matches the MD5 checksum of the file received by IAS3.
 * @param params.checksum Skip uploading files based on checksum.
 * @param params.deleteFile Delete local file after the upload has been successfully verified.
 * @param params.retries Number of times to retry the given request if S3 returns a 503 SlowDown error.
 * @param params.retriesSleep Amount of time to sleep between retries.
 * @param params.debug Set to True to print headers to stdout, and exit without sending the upload request.
 * @param params.validateIdentifier Set to True to validate the identifier before uploading the file.
 * 
 * @returns A list of Requests if debug else a list of Responses.
 */
export function uploadFiles(identifier: string, files: IaFileObject | IaFileObject[] | string | string[], params: IaUploadParams): Promise<Request[] | Response[]> {
    return getItem(identifier, params)
        .then(item => item.upload(files, params));
}


/**
 * Download files from an item.
 * @param identifier The globally unique Archive.org item identifier.
 * @param param1.files Only return files matching the given file names.
 * @param param1.formats Only return files matching the given formats.
 * @param param1.globPattern Only return files matching the given glob pattern.
 * @param param1.dryRun Print URLs to files to stdout rather than downloading them.
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
 * @param param1.noChangeTimestamp 
 * @param param1.timeout 
 * @param param1.config A dictionary used to configure your session.
 * @param param1.configFile A path to a config file used to configure your session.
 * @param param1.archiveSession An {@link IaSession} object.
 * @param param1.debug To be passed on to getSession(). 
 * @returns A list Requests if debug else a list of Responses.
 */
export function downloadFiles(identifier: string, params: IaItemDownloadParams & IaGetItemParams): Promise<Response[] | string[]> {
    return getItem(identifier, params)
        .then(item => item.download(params));
}

/**
 * Delete files from an item. Note: Some system files, such as `<itemname>_meta.xml`, cannot be deleted.
 * @param identifier The globally unique Archive.org identifier for a given item.
 * @param param1 Delete item params
 * @param param1.files Only return files matching the given filenames.
 * @param param1.formats Only return files matching the given formats.
 * @param param1.globPattern Only return files matching the given glob pattern.
 * @param param1.cascadeDelete Delete all files associated with the specified file, including upstream derivatives and the original.
 * @param param1.accessKey IA-S3 accessKey to use when making the given request.
 * @param param1.secretKey IA-S3 secretKey to use when making the given request.
 * @param param1.verbose Print actions to stdout.
 * @param param1.debug Set to True to print headers to stdout and exit exit without sending the delete request.
 * @param param1.getItemKwargs
 * @throws {Error} iii
 * @returns 
 */
export async function deleteFiles(identifier: string, params: IaDeleteItemParams): Promise<Request[] | Response[]> {
    const iaFiles = await getFiles(identifier, params);

    const responses: (Request[] | Response[]) = [];
    for (const f of iaFiles) {
        const response = await f.delete(params);
        // TODO fix
        responses.push(response as any);
    }
    return responses;
}

/**
 * Get tasks from the Archive.org catalog.
 * @param params The URL parameters to send with each request sent to the Archive.org catalog API.
 * @returns A set of {@link CatalogTask} objects.
 */
export async function getTasks(params: IaGetSessionParams & IaGetTasksParams): Promise<CatalogTask[]> {
    let { archiveSession, config } = params;
    archiveSession ??= await getSession(config, false);
    return archiveSession.getTasks(params);
}

/**
 * Search for items on Archive.org.
 * 
 * @example
 * const s = getSession();
 * const searchResults = s.searchItems('nasa');
 * 
 * @param query The Archive.org search query to yield results for. Refer to {@link https://archive.org/advancedsearch.php/raw} for help formatting your query.
 * @param params Search parameters
 * @param params.fields The metadata fields to return in the search results.
 * @param params.sorts 
 * @param params.params The URL parameters to send with each request sent to the Archive.org Advancedsearch Api.
 * @param params.fullTextSearch Beta support for querying the archive.org Full Text Search API.
 * @param params.dslFts Beta support for querying the archive.org Full Text Search API in dsl (i.e. do not prepend `!L` to the `full_text_search` query.
 * @param params.archiveSession 
 * @param params.config Configuration options for session.
 * @param params.configFile A path to a config file used to configure your session.
 * @param params.maxRetries The number of times to retry a failed request.
 * @returns 
 */
export async function searchItems(query: string, params: IaSearchItemsParams): Promise<IaSearch> {
    const archiveSession = params.archiveSession ?? await getSession(params.config, false);
    return archiveSession.searchItems(query, params);
}

/**
 * Configure internetarchive with your Archive.org credentials.
 * 
 * @example
 * import {configure} from "internetarchive-ts";
 * configure('user@example.com', 'password')
 * 
 * @param username The email address associated with your Archive.org account.
 * @param password Your Archive.org password.
 * @param configFile 
 * @param host 
 * @returns The config file path.
 */
/*export async function configure(
    username: string,
    password: string,
    configFile?: string,
    host: string = "archive.org",
): Promise<string> {
    const authConfig = await getAuthConfig(
        username,
        password,
        host,
    );
    const configFilePath = writeConfigFile(authConfig, configFile);
    return configFilePath;
}*/

/**
 * 
 * @param accessKey IA-S3 accessKey to use when making the given request
 * @param secretKey IA-S3 secretKey to use when making the given request
 * @returns The username or an empty string if response contains no username.
 */
export function getUsername(accessKey: string, secretKey: string): Promise<string> {
    return getUserInfo(accessKey, secretKey).then(j => j.username ?? "");
}


/**
 * Returns details about an Archive.org user given an IA-S3 key pair.
 * @param accessKey IA-S3 accessKey to use when making the given request.
 * @param secretKey IA-S3 secretKey to use when making the given request.
 * @throws {IaApiError}
 * @throws {IaApiaAuthenticationError}
 * @returns Archive.org use info.
 */
export async function getUserInfo(accessKey: string, secretKey: string): Promise<IaUserInfo> {
    const url = new URL("https://s3.us.archive.org");
    url.searchParams.set("check_auth", "1");

    const response = await fetch(url.href, {
        method: 'GET',
        headers: createS3AuthHeader(accessKey, secretKey)
    });
    if (!response.ok) {
        throw handleIaApiError(response);
    }
    const json = await response.json();
    if (json.error) {
        throw new IaApiaAuthenticationError(json.error, { response });
    }
    return json;
}

/**
* Check if the item identifier is available for creating a new item.
* @returns true if identifier is available, or false if it is not available.
* @throws {IaApiError}
* @throws {IaApiInvalidIdentifierError}
*/
export async function isIdentifierAvailable(identifier: string, params?: IaGetSessionParams): Promise<boolean> {
    const archiveSession = params?.archiveSession ?? await getSession(params?.config, false);
    return archiveSession.isIdentifierAvailable(identifier);
}