import { IaApiJsonResult } from "../types/index.js";
import { handleIaApiError } from "./handleIaApiError.js";
import { IaApiError } from "../error/index.js";

export async function getApiResultValue<T>(response: Response): Promise<T> {
    const json = await response.json() as Partial<IaApiJsonResult<T>>;
    if (typeof json !== "object") throw new IaApiError("Response type is not valid", { response, responseBody: json });
    if (json.success === true && json.value !== undefined) {
        return json.value;
    } else {
        throw await handleIaApiError({ response, responseBody: json });
    }
}
