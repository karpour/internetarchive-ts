import { IaItemData, IaItemMetadata, IaRequestTarget, IaTaskPriority } from "../types";
import IaRequest from "./IaRequest";
import preparePatch from "./preparePatch";


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

export type IaPatchData = ({
    '-patch': string
    '-target': IaRequestTarget,
} | {
    '-changes': string
}) & {
    'priority': IaTaskPriority,
}


function prepareBody(
    url: string,
    metadata: IaItemMetadata | IaMultiMetadata,
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
    if (validateMetadataArray(metadata)) {
        const changes: any[] = [];

        for (let key in Object.keys(metadata)) {
            if (key == 'metadata') {
                try {
                    patch = preparePatch({
                        metadata: metadata[key],
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
                key = key.split('/')[0];
                patch = prepareTargetPatch({
                    metadata,
                    sourceMetadata,
                    append,
                    target,
                    appendList,
                    key,
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