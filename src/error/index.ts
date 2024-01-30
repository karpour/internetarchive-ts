import { Prettify } from "../types";

export abstract class IaError extends Error { }

export class IaTypeError extends IaError { }

export class IaValueError extends IaError { }

export class IaItemLocateError extends IaError {
    public constructor(message: string = 'Item cannot be located because it is dark or does not exist.') {
        super(message);
    }
}

export class IaInvalidIdentifierError extends IaTypeError { }

export class IaAuthenticationError extends IaError { }


// API Errors

export type IaApiErrorOptions = Prettify<ErrorOptions & {
    request?: Request,
    response?: Response;
}>;

export type IaApiErrorOptionsWithStatus<Status extends number = number> =
    Prettify<ErrorOptions & (IaApiErrorOptions & { status: Status; }) | (Exclude<IaApiErrorOptions, 'response'> & { status?: Status; })>;

/**
 * Base Api Error
*/
export class IaApiError<Status extends number = number> extends IaError {
    public readonly status?: Status;
    public readonly request?: Request;
    public readonly response?: Response;
    public constructor(message: string, options: IaApiErrorOptionsWithStatus<Status> = {}) {
        super(message, options);
        this.request = options.request;
        this.response = options.response;
        this.status = (this.response?.status as Status) ?? options.status;
    }
}

export class IaApiFileUploadError<Status extends number = number> extends IaApiError<Status> { }

export class IaApiaAuthenticationError<Status extends number = number> extends IaApiError<Status> { }

export class IaApiInvalidIdentifierError<Status extends number = number> extends IaApiError<Status> { }

/**
 * Indicates some element of the request was malformed or inappropriate. 
 * Often means a required parameter was missing, in either the query 
 * parameters or the {@link https://archive.org/developers/iarest.html#client-request | request payload}.
 * @see {@link https://archive.org/developers/iarest.html#unauthorized}
 */
export class IaApiBadRequestError extends IaApiError<400> {
    public constructor(message: string = "Bad Request", options: IaApiErrorOptions) {
        super(message, { ...options, status: 400 });
    }
}

/**
 * Most readings of the HTTP specification differentiate between 401 Unauthorized as 
 * an authentication error and 403 Forbidden as an authorization error. 
 * Due to internal limitations, IA microservices cannot return 403 Forbidden, 
 * as this will cause a static HTML page to be returned to the client. 401 Unauthorized
 * is used for both authentication and authorization errors.
 * HTTP requires a WWW-Authenticate header be sent with a 401 response. We don’t do that at this time.
 * @see {@link https://archive.org/developers/iarest.html#unauthorized}
 */
export class IaApiUnauthorizedError extends IaApiError<401> {
    public constructor(message: string = "Unauthorized", options: IaApiErrorOptions) {
        super(message, { ...options, status: 401 });
    }
}

/**
 * Indicates the requested resource is not present. 
 * For example, the Reviews API will return a 404 Not Found if the client performs 
 * a GET on an item that does not exist or if the user has not submitted a review 
 * for the item. The error field in the JSON payload will differentiate between the two.
 */
export class IaApiNotFoundError extends IaApiError<404> {
    public constructor(message: string = "Not found", options: IaApiErrorOptions) {
        super(message, { ...options, status: 404 });
    }
}

/**
 * Returned if the client invoked the microservice with a method the service does not support.
 */
export class IaApiMethodNotAllowedError extends IaApiError<405>  {
    public constructor(message: string = "Not found", options: IaApiErrorOptions) {
        super(message, { ...options, status: 405 });
    }
}

/**
 * Returned if the requested change could not be satisfied due to the current state of the 
 * resource or another resource. 
 * For example, the Tasks API will return a 409 if the user attempts to rename the item 
 * identifier to an identifier already in use.
 */
export class IaApiConflictError extends IaApiError<409> {
    public constructor(message: string = "Conflict", options: IaApiErrorOptions) {
        super(message, { ...options, status: 409 });
    }
}


/**
 * Used to indicate the client is being rate-limited due to an excessive 
 * number of requests over a period of time. 
 * The client should take a breather and try again later.
 */
export class IaApiTooManyRequestsError extends IaApiError<429> {
    public constructor(message: string = "Too Many Reuqests", options: IaApiErrorOptions) {
        super(message, { ...options, status: 429 });
    }
}

/**
 * Used to indicate the client is being rate-limited due to an excessive 
 * number of requests over a period of time. 
 * The client should take a breather and try again later.
 */
export class IaApiServiceUnavailableError extends IaApiError<503> {
    public constructor(message: string = "Service Unavailable", options: IaApiErrorOptions) {
        super(message, { ...options, status: 503 });
    }
}

/**
 * Used to indicate the client is being rate-limited due to an excessive 
 * number of requests over a period of time. 
 * The client should take a breather and try again later.
 */
export class IaApiInternalServerError extends IaApiError<500> {
    public constructor(message: string = "Internal Server Error", options: IaApiErrorOptions) {
        super(message, { ...options, status: 500 });
    }
}