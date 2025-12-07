import { IaBaseMetadataType, IaRawMetadata } from "../types/index.js";
import { convertToStringOrStringArray } from "./convertToStringOrStringArray.js";

export function convertToRawMetadata<T extends IaBaseMetadataType>(metadata: T): IaRawMetadata<T> {
    const rawMetadata: IaRawMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
        rawMetadata[key] = convertToStringOrStringArray(value);
    }
    return rawMetadata as IaRawMetadata<T>;
}