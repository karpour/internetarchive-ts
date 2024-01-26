import log from "../logging/log";
import { IaBaseMetadataType, IaItemData, IaPatchData, IaRequestTarget, IaTaskPriority, Prettify } from "../types";
import IaRequest, { IaRequestConstructorParams } from "./IaRequest";
import { prepareFilesPatch } from "./prepareFilesPatch";
import preparePatch from "./preparePatch";
import { prepareTargetPatch } from "./prepareTargetPatch";


export class IaMetadataRequest extends IaRequest {
    public constructor(url:string, params: IaMetadataRequestPrepareBodyParams) {
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

type IaMultiMetadata = {
    [target in IaRequestTarget]: IaBaseMetadataType
};

export type IaMetadataRequestPrepareBodyParams = {
    metadata: IaMultiMetadata | IaBaseMetadataType,
    sourceMetadata: IaItemData,
    target?: IaRequestTarget,
    priority: IaTaskPriority,
    append: boolean,
    appendList: boolean,
    insert: boolean;
};

export type IaMetadataRequestConstructorParams = Prettify<IaMetadataRequestPrepareBodyParams & IaRequestConstructorParams>

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
    if (validateMetadata(metadata)) {
        const changes: any[] = [];

        for (const entry of Object.entries(metadata)) {
            const [key, metadata] = entry;
            if (key == 'metadata') {
                try {
                    patch = preparePatch({
                        metadata: metadata,
                        sourceMetadata: sourceMetadata.metadata,
                        append,
                        appendList,
                        insert
                    });
                } catch (err: any) {
                    throw err;
                }
            } else if (key.startsWith('files')) {
                patch = prepareFilesPatch({
                    target: key, // TODO correct?
                    metadata: metadata[key],
                    sourceFilesMetadata: sourceMetadata.files,
                    append,
                    appendList,
                    insert
                });
            } else {
                patch = prepareTargetPatch({
                    metadata,
                    sourceMetadata,
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
        } else if (target.startsWith('files/')) {
            patch = prepareFilesPatch(metadata, sourceMetadata.files, append, target, appendList, insert);
        } else {
            metadata = { target: metadata };
            patch = prepareTargetPatch(metadata, sourceMetadata, append, target, appendList, target, insert);
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