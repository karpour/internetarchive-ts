import { IaFileRequestTarget, IaPrepareFilesPatchParams } from "../types";
import preparePatch from "./preparePatch";


export function getFilenameFromTarget<T extends string>(target: IaFileRequestTarget<T>): T {
    return target.replace(/^files\//, '') as T;
}

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