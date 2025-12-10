import { IaTypeError } from "../error/index.js";

export function createSearchParams(options: Record<string, string | string[] | number | undefined | boolean>): URLSearchParams {
    const urlSearchParams = new URLSearchParams();
    for (let [key, value] of Object.entries(options)) {
        if (value === undefined) continue;
        switch (typeof value) {
            case "string":
            case "number":
            case "boolean":
                urlSearchParams.append(key, `${value}`);
                break;
            default:
                throw new IaTypeError(`Invalid option value type: ${typeof value}`);
        }
    }
    return urlSearchParams;
}
