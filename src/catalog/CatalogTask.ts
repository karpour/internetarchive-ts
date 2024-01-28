import { IaApiError, IaValueError } from "../error";
import IaSession from "../session/IaSession";
import { handleIaApiError } from "../util/handleIaApiError";
import Catalog from "./Catalog";

/** See {@link https://archive.org/developers/tasks.html#wait-admin-and-run-states} */
export const IaTaskColors = [
    //0: Queued (green)
    "green",
    //1: Running (blue)
    "blue",
    //2: Error (red)
    "red",
    //9: Paused (brown)
    "brown",
    "done"
] as const;

export type IaTaskColor = typeof IaTaskColors[number];

interface IaTaskDict {
    color?: IaTaskColor;
    identifier: string;
    taskId: string;
    server: string;
    cmd: string;
    submitter: string;
    submittime: string;
    category: string;
}

/**
 * This class represents an Archive.org catalog task. 
 * It is primarily used by {@link Catalog}, and should not be used directly.
 */
export class CatalogTask implements IaTaskDict {
    protected session: IaSession;

    public constructor(protected taskDict: IaTaskDict, catalogObj: Catalog) {
        this.session = catalogObj.session;
    }

    public get taskId(): string {
        return this.taskDict.taskId;
    }

    public get color(): IaTaskColor {
        return this.taskDict.color ?? 'done';
    }

    public get identifier(): string {
        return this.taskDict.identifier;
    }

    public get server(): string {
        return this.taskDict.server;
    }

    public get submittime(): string {
        return this.taskDict.submittime;
    }

    public get cmd(): string {
        return this.taskDict.cmd;
    }
    
    public get submitter(): string {
        return this.taskDict.submitter;
    }

    // TODO figure this out
    public get category(): string {
        return this.taskDict.category;
    }

    public toString() {
        return `CatalogTask(identifier=${this.taskDict.identifier},` +
            ` taskId=${this.taskDict.taskId},` +
            ` server=${this.taskDict.server},` +
            ` cmd=${this.taskDict.cmd},` +
            ` submitter=${this.taskDict.submitter},` +
            ` color=${this.color})`;
    }

    public json(): string {
        return JSON.stringify(this.taskDict);
    }

    /**
     * Get task log.
     * @returns The task log as a string.
     */
    public async taskLog(): Promise<string> {
        if (!this.taskId) {
            throw new IaValueError('task_id is None');
        }
        return CatalogTask.getTaskLog(this.taskId, this.session);
    }

    /**
     * 
     * @param taskId The task id for the task log you'd like to fetch.
     * @param session The ArchiveSession
     * @returns 
     */
    public static async getTaskLog(
        taskId: number | string,
        session: IaSession
    ): Promise<string> {
        const host = (session.host === 'archive.org') ? 'catalogd.archive.org' : session.host;
        const url = `${session.protocol}//${host}/services/tasks.php`;
        const params = { task_log: taskId };
        const response = await session.get(url, { params });
        if (!response.ok) {
            throw handleIaApiError(response);
        }
        if (response.body) {
            return response.text()
        }
        throw new IaApiError(`Empty body`,{response});
    }
}

export default CatalogTask;