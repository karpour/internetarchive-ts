import {
    IaApiConflictError,
    IaApiError,
    IaApiMethodNotAllowedError,
    IaApiNotFoundError,
    IaApiTooManyRequestsError,
    IaApiUnauthorizedError,
    IaApiBadRequestError
} from "../error";

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

export async function handleIaApiError(response: Response, defaultMessage?: string): Promise<IaApiError> {
    let json;
    try {
        json = await response.json() as { error?: string; };
    } catch (err) { }
    const error = json?.error ?? defaultMessage;
    switch (response.status) {
        case 400:
            return new IaApiBadRequestError(error, { response });
        case 401:
            return new IaApiUnauthorizedError(error, { response });
        case 404:
            return new IaApiNotFoundError(error, { response });
        case 405:
            return new IaApiMethodNotAllowedError(error, { response });
        case 409:
            return new IaApiConflictError(error, { response });
        case 429:
            return new IaApiTooManyRequestsError(error, { response });
        default:
            return new IaApiError(error ?? "Unexpected HTTP Response status", { response });
    }
}
