import { IaApiJsonErrorResult } from "../types";

export function isApiJsonErrorResult(result: any): result is IaApiJsonErrorResult {
    return result.error !== undefined;
}
