import { IaApiError } from "../error";

// TODO
export function raiseForStatus(response: Response): void {
    if(!response.ok) throw new IaApiError(`Error ${response.status}`)
}
