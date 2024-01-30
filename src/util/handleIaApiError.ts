import {
    IaApiConflictError,
    IaApiError,
    IaApiMethodNotAllowedError,
    IaApiNotFoundError,
    IaApiTooManyRequestsError,
    IaApiUnauthorizedError,
    IaApiBadRequestError
} from "../error";
import { IaApiJsonResult } from "../types";

/**
 * Creates an {@link IaApiError} object based on a non-200 status Response.
 * It is assumed that Response.ok has been checked before calling this function.
 * @param response Response with a non-200 status code
 * @param defaultMessage Message to default to in case the Response json contains no `error` field
 * @returns Error object corresponding to the error code
 * @throws {IaApiBadRequestError}
 * @throws {IaApiUnauthorizedError}
 * @throws {IaApiNotFoundError}
 * @throws {IaApiMethodNotAllowedError}
 * @throws {IaApiTooManyRequestsError}
 * @throws {IaApiError}
 */

export async function handleIaApiError(response: Response, request?: Request, defaultMessage?: string): Promise<IaApiError> {
    let error = defaultMessage;
    if (response.headers.get("Content-Type") === "application/json") {
        try {
            const json = await response.json() as IaApiJsonResult;
            error = json?.error ?? defaultMessage;
        } catch (err) { }
    }
    switch (response.status) {
        case 400:
            return new IaApiBadRequestError(error, { response, request });
        case 401:
            return new IaApiUnauthorizedError(error, { response, request });
        case 404:
            return new IaApiNotFoundError(error, { response, request });
        case 405:
            return new IaApiMethodNotAllowedError(error, { response, request });
        case 409:
            return new IaApiConflictError(error, { response, request });
        case 429:
            return new IaApiTooManyRequestsError(error, { response, request });
        default:
            return new IaApiError(error ?? "Unexpected HTTP Response status", { response, request });
    }
}
