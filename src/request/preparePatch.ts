import { IaBaseMetadataType, IaItemData, IaPreparePatchParams } from "../types";
import { deleteKeysFromObject } from "./deleteKeysFromObject";
import { prepareMetadata } from "./prepareMetadata";
import { createPatch } from "rfc6902";



export default function preparePatch({
    metadata,
    sourceMetadata = {},
    append = false,
    appendList = false,
    insert = false }: IaPreparePatchParams) {

    const preparedMetadata = prepareMetadata({metadata, sourceMetadata, append, appendList, insert});
    const destinationMetadata = { ...structuredClone(sourceMetadata), ...preparedMetadata };

    // Delete metadata items where value is REMOVE_TAG.
    deleteKeysFromObject(destinationMetadata, 'REMOVE_TAG');
    return createPatch(sourceMetadata, destinationMetadata);
}

