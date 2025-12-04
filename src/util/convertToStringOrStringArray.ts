import { IaTypeError } from "../error";
import { IaMetadataValidFieldType, StringOrStringArray } from "../types";

/** 
 * @internal 
 * 
 * 
 * @throws Type error
*/
export function convertToStringOrStringArray<T extends IaMetadataValidFieldType | IaMetadataValidFieldType[]>(value: T): StringOrStringArray<T> {
    switch (typeof value) {
        case "string":
        case "number":
        case "bigint":
        case "boolean":
            return `${value}` as StringOrStringArray<T>;
        case "undefined":
            // TODO handle undefined differently?
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
