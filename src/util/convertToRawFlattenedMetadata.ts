import { IaBaseMetadataType, IaRawFlattenedMetadataType, IaRawFlattenedMetadata } from "../types";
import { IaTypeError } from "../error";



export function convertToRawFlattenedMetadata<T extends IaBaseMetadataType>(metadata: T): IaRawFlattenedMetadata<T> {
    const rawMetadata: IaRawFlattenedMetadataType = {};
    for (const entry of Object.entries(metadata)) {
        const [key, value] = entry;
        switch (typeof value) {
            case "string":
            case "number":
            case "bigint":
            case "boolean":
                rawMetadata[key] = `${value}`;
                break;
            // @ts-ignore 
            case "object":
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        if (value !== undefined && value !== null) {
                            rawMetadata[`${key}[${i}]`] = `${value[i]}`;
                        }
                    }
                    break;
                }
            // Intentional fallthrough here
            case "symbol":
            case "function":
                throw new IaTypeError(`Metadata object key "${key}" has illegal value of type "${typeof value}"`);
            //case "undefined":
            default:
                break;
        }
    }
    return rawMetadata as IaRawFlattenedMetadata<T>;
}
