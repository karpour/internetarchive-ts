import { IaApiaAuthenticationError, IaAuthenticationError } from "../error";
import log from "../logging/log";
import { IaAuthConfig, IaAuthConfigSectionName } from "../types";
import { existsSync, mkdirSync, chmodSync } from "fs";
import path, { isAbsolute } from "path";
import { homedir } from "os";
/**
 * 
 * @param email 
 * @param password 
 * @param host 
 * @returns 
 */
export async function getAuthConfig(email: string, password: string, host: string = 'archive.org'): Promise<IaAuthConfig> {
    const url = `https://${host}/services/xauthn/`;
    const params = { op: 'login' };
    const body = JSON.stringify({ email, password });
    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        body,
        headers: { "Content-Type": "application/json" }
    });
    const json = await response.json();

    if (!json.success) {
        const msg = json.values?.reason ?? json.error;
        if (msg == 'account_not_found') {
            throw new IaApiaAuthenticationError('Account not found, check your email and try again.', { response });
        } else if (msg == 'account_bad_password') {
            throw new IaApiaAuthenticationError('Incorrect password, try again.', { response });
        } else if (!msg) {
            throw new IaApiaAuthenticationError(`Authentication failed, but no value.reason or error field was set in response.`, { response });
        } else {
            throw new IaApiaAuthenticationError(`Authentication failed: ${msg}`, { response });
        }
    }
    const authConfig = {
        s3: {
            'access': json['values']?.['s3']?.['access'],
            'secret': json['values']?.['s3']?.['secret'],
        },
        cookies: {
            'logged-in-user': json['values']['cookies']['logged-in-user'],
            'logged-in-sig': json['values']['cookies']['logged-in-sig'],
        },
        general: {
            'screenname': json['values']['screenname'],
        }
    };
    return authConfig;
}

/*export function writeConfigFile(authConfig: Partial<IaAuthConfig>, configFile?: string) {
    const { configFilePath, isXdg, config } = parseConfigFile(configFile);
    const configParser = new ConfigParser();

    for (const section of Object.keys(config)) {
        const s = section as IaAuthConfigSectionName;
        if (authConfig[s]) {
            config[s] = { ...config[s], ...authConfig[s] } as any;
        }
        for (const entry in Object.entries(section)) {
            const [key, value] = entry;
            if (value !== undefined) {
                configParser.set(section, key, value);
            }
        }
    }

    // Create directory if needed.
    const configDirectory = path.dirname(configFilePath);
    if (isXdg && !existsSync(configDirectory)) {
        // os.makedirs does not apply the mode for intermediate directories since Python 3.7.
        // The XDG Base Dir spec requires that the XDG_CONFIG_HOME directory be created with mode 700.
        // is_xdg will be True iff config_file is ${XDG_CONFIG_HOME}/internetarchive/ia.ini.
        // So create grandparent first if necessary then parent to ensure both have the right mode.
        mkdirSync(path.dirname(configDirectory), {
            mode: 0o700,
            recursive: true
        });
        mkdirSync(configDirectory, {
            mode: 0o700,
        });
    }

    configParser.write(configFilePath, true);
    chmodSync(configFilePath, 0o600);

    return configFilePath;
}*/

function getConfigFilePath(configFile?: string): { configFilePath: string, isXdg: boolean; } {
    let configFilePath = configFile;

    let isXdg: boolean = false;
    /** {@link https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html XDG Base Directory Specification} */
    let xdgConfigHome = process.env['XDG_CONFIG_HOME'];
    if (!xdgConfigHome || !isAbsolute(xdgConfigHome)) {
        // Per the XDG Base Dir specification, this should be $HOME /.config. Unfortunately, $HOME
        // does not exist on all systems. Therefore, we use ~/.config here. On a POSIX-compliant
        // system, where $HOME must always be set, the XDG spec will be followed precisely.
        xdgConfigHome = path.join(homedir(), '.config');
    }
    const xdgConfigFile = path.join(xdgConfigHome, 'internetarchive', 'ia.ini');
    if (!configFilePath) {
        let candidates: string[] = [];
        if (process.env['IA_CONFIG_FILE']) {
            candidates.push(process.env['IA_CONFIG_FILE']);
        }
        candidates.push(xdgConfigFile);
        candidates.push(path.join(homedir(), '.config', 'ia.ini'));
        candidates.push(path.join(homedir(), '.ia'));
        if (candidates.length > 0) {
            for (let candidate of candidates) {
                log.verbose(`Checking for config file at path "${candidate}"`);
                if (existsSync(candidate)) {
                    log.verbose(`Found config file at "${candidate}"`);
                    configFilePath = candidate;
                    break;
                }
            }
        }
        if (!configFilePath) {
            configFilePath = process.env['IA_CONFIG_FILE'] ?? xdgConfigFile;
        }
    }
    if (configFilePath == xdgConfigFile) {
        isXdg = true;
    }
    return { configFilePath, isXdg };
}


/*export function parseConfigFile(configFile?: string): { configFilePath: string, isXdg: boolean, config: IaAuthConfig; } {
    const { configFilePath, isXdg } = getConfigFilePath(configFile);

    const config: IaAuthConfig = {
        s3: {
            'access': undefined,
            'secret': undefined
        },
        cookies: {
            'logged-in-user': undefined,
            'logged-in-sig': undefined
        },
        general: {
            'screenname': undefined,
            'secure': undefined
        }
    };

    if (existsSync(configFilePath)) {
        const configParser = new ConfigParser();
        configParser.read(configFilePath);
        for (const section of Object.entries(config)) {
            const [sectionName, sectionBody] = section;
            for (const item of Object.keys(sectionBody)) {
                (sectionBody as Record<string, any>)[item] = configParser.get(sectionName, item);
            }
        }
    }

    return { configFilePath, isXdg, config };
}

export function getConfig(configObj?: Partial<IaAuthConfig>, configFile?: string): IaAuthConfig {
    return parseConfigFile(configFile).config;
    // TODO extract mergeconfig func and use it in both writeconfig and here
}*/
