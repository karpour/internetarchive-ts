import IaRequest from "../request/IaRequest";

export abstract class IaError extends Error { }

export class IaTypeError extends IaError { }

export class IaApiError extends IaError { 
    public constructor(message:string, public readonly request?: IaRequest) {
        super(message)
    }
}