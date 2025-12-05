import { IaApiJsonErrorResult } from "../types";

export function isApiJsonErrorResult(result: unknown): result is IaApiJsonErrorResult {
    return Object(result).error !== undefined;
}
