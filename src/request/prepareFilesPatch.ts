import { IaTypeError } from "../error/index.js";
import { IaFileRequestTarget, IaPrepareFilesPatchParams } from "../types/index.js";
import preparePatch from "./preparePatch.js";

/**
 * Strips the "files/" prefix from a string
 * @param target string that starts with "files/"
 * @returns String without prefix
 * @throws {@link IaTypeError}
 */
export function getFilenameFromTarget<T extends string>(target: IaFileRequestTarget<T>): T {
    if (!target.startsWith("files/")) throw new IaTypeError(`target does not start with "files/": "${target}"`);
    return target.replace(/^files\//, '') as T;
}

/**
 * 
 * @param param0 
 * @returns 
 * @throws {@link IaTypeError}
 */
export function prepareFilesPatch({
    metadata,
    sourceFilesMetadata: sourceFilesMetadata,
    append,
    target,
    appendList,
    insert
}: IaPrepareFilesPatchParams) {
    const filename = getFilenameFromTarget(target);
    const sourceMetadata = sourceFilesMetadata.find(s => s.name === filename) ?? {};
    return preparePatch({ metadata, sourceMetadata, append, appendList, insert });
}