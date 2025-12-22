import log from "../log/index.js";
import { existsSync } from "fs";
import path, { isAbsolute } from "path";
import { homedir } from "os";

export function getConfigFilePath(configFile?: string): { configFilePath: string; isXdg: boolean; } {
    let configFilePath = configFile;

    let isXdg: boolean = false;

    /** {@link https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html|XDG Base Directory Specification} */
    let xdgConfigHome = process.env['XDG_CONFIG_HOME'];
    if (!xdgConfigHome || !isAbsolute(xdgConfigHome)) {
        // Per the XDG Base Dir specification, this should be $HOME/.config. Unfortunately, $HOME
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
            for (const candidate of candidates) {
                log.verbose(`Checking for config file at path "${candidate}"`);
                if (existsSync(candidate)) {
                    log.verbose(`Found config file at "${candidate}"`);
                    configFilePath = candidate;
                    break;
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