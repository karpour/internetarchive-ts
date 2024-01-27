import { IaBaseMetadataType, IaMetadataValidFieldType, StringOrStringArray, IaRawMetadata } from "../types";
import { IaTypeError } from "../error";

export function convertToStringOrStringArray<T extends IaMetadataValidFieldType | IaMetadataValidFieldType[]>(value: T): StringOrStringArray<T> {
    switch (typeof value) {
        case "string":
        case "number":
        case "bigint":
        case "boolean":
            return `${value}` as StringOrStringArray<T>;
        case "undefined":
            return undefined as StringOrStringArray<T>;
        // @ts-ignore 
        case "object":
            if (Array.isArray(value)) {
                return value.map(v => `${v}`) as StringOrStringArray<T>;
            }
        // Intentional fallthrough here
        //case "symbol":
        //case "function":
        default:
            throw new IaTypeError(`Can not convert unallowed value "${typeof value}"`);
    }
}

export function convertToRawMetadata<T extends IaBaseMetadataType>(metadata: T): IaRawMetadata<T> {
    const rawMetadata: IaRawMetadata = {};
    for (const entry of Object.entries(metadata)) {
        const [key, value] = entry;
        rawMetadata[key] = convertToStringOrStringArray(value);
    }
    return rawMetadata as IaRawMetadata<T>;
}
