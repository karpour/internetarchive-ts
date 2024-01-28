import { IaBaseMetadataType, IaPreparePatchParams, IaRequestTarget, Prettify } from "../types";
import preparePatch from "./preparePatch";

export type IaPrepareTargetPatchParams = Prettify<IaPreparePatchParams & {
    target: IaRequestTarget,
    key: string,
}>;

export function prepareTargetPatch({
    metadata,
    sourceMetadata,
    append,
    target,
    appendList,
    key,
    insert }: IaPrepareTargetPatchParams) {
    throw new Error("Not implemented");
    // TODO i have no clue
    /*
    let newMetadata: IaBaseMetadataType = {};

    for (const _k in metadata) {
        const parts = _k.split('/');
        newMetadata = dictify(parts.slice(1), metadata[_k])!;
    }

    const splitKey = key.split('/');
    for (let i = 0; i < splitKey.length; i++) {
        const _k = splitKey[i]!;
        if (i == 0)
            sourceMetadata = sourceMetadata[_k] ?? {};
        else
            sourceMetadata[_k] = (sourceMetadata[_k] ?? {})[_k] ?? {};
    }*/
    return preparePatch({ metadata, sourceMetadata, append, appendList, insert });
}



function dictify<T>(lst: string[], value: T): T | Record<string, any> {
    if (lst.length == 0) {
        return value;
    }
    return { [lst[0]!]: dictify(lst.slice(1), value) };
}