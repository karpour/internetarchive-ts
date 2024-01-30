import { IaApiError, IaValueError } from "../error";
import IaSession from "../session/IaSession";
import { IaTaskColor, IaTaskMeta, IaTaskPriority, IaTaskType } from "../types";
import { handleIaApiError } from "../util/handleIaApiError";
import Catalog from "./Catalog";


/**
 * This class represents an Archive.org catalog task. 
 * It is primarily used by {@link Catalog}, and should not be used directly.
 */
export class CatalogTask implements IaTaskMeta {
    protected session: IaSession;

    public constructor(protected taskMetadata: IaTaskMeta, catalogObj: Catalog) {
        this.session = catalogObj.session;
    }

    public get priority(): IaTaskPriority {
        return this.taskMetadata.priority;
    }

    public get finished(): number {
        return this.taskMetadata.finished;
    }

    public get args(): IaTaskMeta['args'] {
        return this.taskMetadata.args;
    }

    public get task_id(): number {
        return this.taskMetadata.task_id;
    }

    public get color(): IaTaskColor {
        return this.taskMetadata.color ?? 'done';
    }

    public get identifier(): string {
        return this.taskMetadata.identifier;
    }

    public get server(): string {
        return this.taskMetadata.server;
    }

    public get submittime(): string {
        return this.taskMetadata.submittime;
    }

    public get cmd(): string {
        return this.taskMetadata.cmd;
    }

    public get submitter(): string {
        return this.taskMetadata.submitter;
    }

    // TODO figure this out
    public get category(): string | undefined {
        return this.taskMetadata.category;
    }

    public toString() {
        return `CatalogTask(identifier=${this.taskMetadata.identifier},` +
            ` taskId=${this.taskMetadata.task_id},` +
            ` server=${this.taskMetadata.server},` +
            ` cmd=${this.taskMetadata.cmd},` +
            ` submitter=${this.taskMetadata.submitter},` +
            ` color=${this.color})`;
    }

    public json(): string {
        return JSON.stringify(this.taskMetadata);
    }

    /**
     * Get task log.
     * @returns The task log as a string.
     */
    public async taskLog(): Promise<string> {
        if (!this.task_id) {
            throw new IaValueError('task_id is None');
        }
        return CatalogTask.getTaskLog(this.task_id, this.session);
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
            throw await handleIaApiError(response);
        }
        if (response.body) {
            return response.text();
        }
        throw new IaApiError(`Empty body`, { response });
    }
}

export default CatalogTask;