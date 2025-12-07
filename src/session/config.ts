/*import { existsSync, mkdirSync, chmodSync } from "fs";
import path from "path";
import { IaAuthConfig, IaAuthConfigSectionName } from "../types/index.js";

export function writeConfigFile(authConfig: Partial<IaAuthConfig>, configFile?: string) {
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