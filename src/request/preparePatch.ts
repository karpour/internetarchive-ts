import { IaBaseMetadataType } from "../types";
import { deleteKeysFromObject } from "./deleteKeysFromObject";
import { prepareMetadata } from "./prepareMetadata";
import { createPatch } from "rfc6902";

export type IaPreparePatchParams = {
    metadata: Readonly<IaBaseMetadataType>,
    sourceMetadata: Readonly<IaBaseMetadataType>,
    append: boolean,
    appendList?: boolean,
    insert?: boolean;
};


export default function preparePatch({
    metadata,
    sourceMetadata = {},
    append = false,
    appendList = false,
    insert = false }: IaPreparePatchParams) {

    const preparedMetadata = prepareMetadata(metadata, sourceMetadata, append, appendList, insert);
    const destinationMetadata = { ...structuredClone(sourceMetadata), ...preparedMetadata };

    // Delete metadata items where value is REMOVE_TAG.
    deleteKeysFromObject(destinationMetadata, 'REMOVE_TAG');
    return createPatch(sourceMetadata, destinationMetadata);
}

