import { IaApiAuthenticationError } from "../error/index.js";
import { IaAuthConfig } from "../types/index.js";
import { handleIaApiError } from "../util/handleIaApiError.js";

/**
 *
 * @param email
 * @param password
 * @param host
 * @returns
 */
export async function getAuthConfig(email: string, password: string, host: string = 'archive.org', secure: boolean = true): Promise<IaAuthConfig> {
    const url = `${secure ? "https" : "http"}://${host}/services/xauthn/?op=login`;
    const body = JSON.stringify({ email, password });
    const response = await fetch(url, {
        method: 'POST',
        body,
        headers: { "Content-Type": "application/json" }
    });
    const json = await response.json();
    if (!json.success) {
        const msg = json.values?.reason ?? json.error;
        if (msg == 'account_not_found') {
            throw new IaApiAuthenticationError('Account not found, check your email and try again.', { response });
        } else if (msg == 'account_bad_password') {
            throw new IaApiAuthenticationError('Incorrect password, try again.', { response });
        } else if (!msg) {
            throw new IaApiAuthenticationError(`Authentication failed, but no values.reason or error field was set in response.`, { response });
        } else {
            throw new IaApiAuthenticationError(`Authentication failed: ${msg}`, { response });
        }
    }
    if (!response.ok) {
        throw await handleIaApiError({ response, responseBody: json });
    }
    console.log(response.headers);
    return json.values as IaAuthConfig;
}