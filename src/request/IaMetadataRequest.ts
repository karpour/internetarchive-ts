import log from "../logging/log";
import { IaBaseMetadataType, IaFileRequestTarget, IaMetadataRequestConstructorParams, IaMetadataRequestPrepareBodyParams, IaPatchData } from "../types";
import IaRequest from "./IaRequest";
import { prepareFilesPatch } from "./prepareFilesPatch";
import preparePatch from "./preparePatch";
import { prepareTargetPatch } from "./prepareTargetPatch";

export class IaMetadataRequest extends IaRequest {
    public constructor(url: string, params: IaMetadataRequestConstructorParams) {
        super(url, (() => {
            return {
                ...params,
                method: "POST",
                body: prepareBody(params),
            };
        })());
    }
}




export function validateMetadata(metadata: object): metadata is IaBaseMetadataType {
    return true;
}


export function isFileRequestTarget(target: string): target is IaFileRequestTarget {
    return target.startsWith("files/");
}


export function prepareBody({
    metadata,
    sourceMetadata,
    target = "metadata",
    priority = -5,
    append = false,
    appendList = false,
    insert = false
}: IaMetadataRequestPrepareBodyParams): string {

    // Write to many targets
    let patch: any;
    let data: IaPatchData;
    if (!validateMetadata(metadata)) {
        const changes: any[] = [];

        for (const entry of Object.entries(metadata)) {
            const [key, metadata] = entry;
            if (key == 'metadata') {
                try {
                    patch = preparePatch({
                        metadata,
                        sourceMetadata: sourceMetadata.metadata,
                        append,
                        appendList,
                        insert
                    });
                } catch (err: any) {
                    throw err;
                }
            } else if (isFileRequestTarget(key)) {
                patch = prepareFilesPatch({
                    target: key,
                    metadata,
                    sourceFilesMetadata: sourceMetadata.files,
                    append,
                    appendList,
                    insert
                });
            } else {
                throw new Error('Not implemented');
                patch = prepareTargetPatch({
                    metadata,
                    sourceMetadata: sourceMetadata.metadata, // Probably wrong
                    append,
                    target,
                    appendList,
                    key: key.split('/')[0]!,
                    insert
                });
            }
            changes.push({ 'target': key, 'patch': patch });
        }
        data = {
            '-changes': JSON.stringify(changes),
            'priority': priority,
        };
        log.debug(`submitting metadata request: ${data}`);
    } else {
        // Write to single target
        if (target === 'metadata') {
            try {
                patch = preparePatch({
                    metadata,
                    sourceMetadata: sourceMetadata['metadata'],
                    append,
                    appendList,
                    insert
                });
            } catch (err: any) {
                throw new Error();// ItemLocateError;
            }
        } else if (isFileRequestTarget(target)) {
            patch = prepareFilesPatch({ metadata, sourceFilesMetadata: sourceMetadata.files, append, target, appendList, insert });
        } else {
            throw new Error('Not implemented');
            //patch = prepareTargetPatch({metadata: { [target]: metadata }, sourceMetadata, append, target, appendList, insert});
        }
        data = {
            '-patch': JSON.stringify(patch),
            '-target': target,
            'priority': priority,
        };
        log.debug(`submitting metadata request: ${data}`);
    }
    return JSON.stringify(data);
}