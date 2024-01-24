import { IaBaseMetadataType, IaItemData, IaItemMetadata, IaRequestTarget, IaTaskPriority } from "../types";
import IaRequest from "./IaRequest";
import { prepareFilesPatch } from "./prepareFilesPatch";
import preparePatch from "./preparePatch";
import { prepareTargetPatch } from "./prepareTargetPatch";


class IaMetadataRequest extends IaRequest {
    public constructor() {
        super((() => {
            return {
                method: "POST",
                url: "bbb"
            };
        })());
    }
}




export function validateMetadata(metadata: object): asserts metadata is IaBaseMetadataType {
    return true;
}

type IaMultiMetadata = {
    [target in IaRequestTarget]: IaBaseMetadataType
}

function prepareBody(
    url: string,
    metadata: IaMultiMetadata,
    sourceMetadata: IaItemData,
    target: IaRequestTarget,
    priority: IaTaskPriority = -5,
    append: boolean,
    appendList: boolean,
    insert: boolean
): string | Buffer {

    // Write to many targets
    let patch: any;
    let data:IaPatchData;
    if (validateMetadata(metadata)) {
        const changes: any[] = [];

        for (const entry in Object.entries(metadata)) {
            const [key, metadata] = entry
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
                    key: key.split('/')[0],
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
        if (!target || target == 'metadata') {
            target = 'metadata';
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
        } else if (target.includes('files')) {
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
    return Buffer.from(JSON.stringify(data));
}