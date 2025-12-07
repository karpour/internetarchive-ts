import {
    IaApiConflictError,
    IaApiError,
    IaApiMethodNotAllowedError,
    IaApiNotFoundError,
    IaApiTooManyRequestsError,
    IaApiUnauthorizedError,
    IaApiBadRequestError,
    IaApiRangeError,
    IaApiScopeUnavailableError,
    IaApiElasticSearchError,
    IaApiAuthenticationError
} from "../error/index.js";
import { IaApiJsonResult } from "../types/index.js";

export type IaHandleApiErrorParams = {
    response: Response,
    responseBody?: string | Record<string, any>,
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

    if (!responseBody) {
        if (response.headers.get("Content-Type") === "application/json") {
            responseBody = (await response.json()) as IaApiJsonResult;
        } else {
            responseBody = await response.text();
        }
    }


    if (typeof responseBody === "object" && typeof responseBody.error === "string") {
        error = responseBody.error as string;
        if (responseBody.errorType) {
            const errorType = responseBody.errorType;
            switch (errorType) {
                case "RangeError":
                    throw new IaApiRangeError(error, { response, request, responseBody });
                default:
            }
        } else if (error.startsWith("[SCOPE_UNAVAILABLE]")) {
            // Handle Scope errors
            throw new IaApiScopeUnavailableError(error, { response, request, responseBody });
        } else if (error.startsWith("The request signature we calculated does not match the signature you provided")) {
            // Handle Scope errors
            throw new IaApiAuthenticationError(error, { response, request, responseBody });
        } else if (error === "invalid or no response from Elasticsearch") {
            // Handle ElasticSearch Errors
            if (responseBody.forensics) {
                if(responseBody.forensics.decoded_reply?.message) {
                    error = responseBody.forensics.decoded_reply.message?.[0] as string ?? error;
                }else if(responseBody.forensics.decoded_reply?.error?.root_cause?.[0].reason) {
                    error = responseBody.forensics.decoded_reply?.error?.root_cause?.[0].reason as string ?? error;
                }
            }
            throw new IaApiElasticSearchError(error, { response, request, responseBody });
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
            return new IaApiError(error ?? `Unexpected HTTP Response: ${response.status}`, { response, request, responseBody });
    }
}
