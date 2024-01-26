import { IaBaseMetadataType, IaRawRawMetadataType } from "../types";
import { IaTypeError } from "../error";
import { RawifiedMetadata } from "../types/flatcrap";



export function convertToRawMetadata<T extends IaBaseMetadataType>(metadata: T): RawifiedMetadata<T> {
    const rawMetadata: IaRawRawMetadataType = {};
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
    return rawMetadata as RawifiedMetadata<T>;
}
