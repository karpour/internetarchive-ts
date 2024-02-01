import { IaApiJsonResult } from "../types";
import { handleIaApiError } from "./handleIaApiError";
import { IaApiError } from "../error";

export async function getApiResultValue<T>(response: Response): Promise<T> {
    const json = await response.json() as Partial<IaApiJsonResult<any>>;
    if (typeof json !== "object") throw new IaApiError("Response type is not valid", { response, responseBody: json });
    if (json.success === true && json.value !== undefined) {
        return json.value as T;
    } else {
        throw await handleIaApiError({ response, responseBody: json });
    }
}
