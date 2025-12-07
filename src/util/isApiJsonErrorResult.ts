import { IaApiJsonErrorResult } from "../types/index.js";

export function isApiJsonErrorResult(result: unknown): result is IaApiJsonErrorResult {
    return Object(result).error !== undefined;
}
