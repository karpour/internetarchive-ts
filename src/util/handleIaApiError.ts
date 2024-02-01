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

export type IaHandleApiErrorParams = {
    response: Response,
    responseBody?: any,
    request?: Request,
    defaultMessage?: string;
};

/**
 * Creates an {@link IaApiError} object based on a non-200 status Response.
 * It is assumed that Response.ok has been checked before calling this function.
 * @param param0.response Response with a non-200 status code
 * @param param0.responseBody
 * @param param0.request
 * @param param0.defaultMessage Message to default to in case the Response json contains no `error` field
 * @returns Error object corresponding to the error code
 */
export async function handleIaApiError({
    response,
    responseBody,
    request,
    defaultMessage }: IaHandleApiErrorParams): Promise<IaApiBadRequestError | IaApiUnauthorizedError | IaApiNotFoundError | IaApiMethodNotAllowedError | IaApiTooManyRequestsError | IaApiError> {
    let error = defaultMessage;
    if (responseBody && typeof responseBody === "object") {
        error = responseBody?.error ?? defaultMessage;
    } else {
        if (response.headers.get("Content-Type") === "application/json") {
            try {
                responseBody = await response.json() as IaApiJsonResult;
                error = responseBody?.error ?? defaultMessage;
            } catch (err) { }
        }
    }

    switch (response.status) {
        case 400:
            return new IaApiBadRequestError(error, { response, request, responseBody });
        case 401:
            return new IaApiUnauthorizedError(error, { response, request, responseBody });
        case 404:
            return new IaApiNotFoundError(error, { response, request, responseBody });
        case 405:
            return new IaApiMethodNotAllowedError(error, { response, request, responseBody });
        case 409:
            return new IaApiConflictError(error, { response, request, responseBody });
        case 429:
            return new IaApiTooManyRequestsError(error, { response, request, responseBody });
        default:
            return new IaApiError(error ?? "Unexpected HTTP Response status", { response, request, responseBody });
    }
}
