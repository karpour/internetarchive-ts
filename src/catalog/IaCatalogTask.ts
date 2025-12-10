import { IaApiError, IaValueError } from "../error/index.js";
import IaSession from "../session/IaSession.js";
import { IaTaskColor, IaTaskMeta, IaTaskPriority } from "../types/index.js";
import { handleIaApiError } from "../util/handleIaApiError.js";
import IaCatalog from "./IaCatalog.js";


/**
 * This class represents an Archive.org catalog task. 
 * It is primarily used by {@link IaCatalog}, and should not be used directly.
 */
export class IaCatalogTask implements IaTaskMeta {
    protected session: IaSession;

    public constructor(protected taskMetadata: IaTaskMeta, catalogObj: IaCatalog) {
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
        return `CatalogTask(identifier=${this.identifier},` +
            ` taskId=${this.task_id},` +
            ` server=${this.server},` +
            ` cmd=${this.cmd},` +
            ` submitter=${this.submitter},` +
            ` color=${this.color})`;
    }

    public inspect() {
        return this.taskMetadata;
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
            throw new IaValueError('task_id is undefined');
        }
        return IaCatalogTask.getTaskLog(this.task_id, this.session);
    }

    /**
     * 
     * @param taskId The task id for the task log you'd like to fetch.
     * @param session The ArchiveSession
     * @returns 
     * @throws {@link IaApiError}
     */
    public static async getTaskLog(
        taskId: number,
        session: IaSession
    ): Promise<string> {
        const host = (session.host === 'archive.org') ? 'catalogd.archive.org' : session.host;
        const url = `${session.protocol}//${host}/services/tasks.php`;
        const params = { task_log: taskId };
        const response = await session.get(url, { params });
        if (!response.ok) {
            throw await handleIaApiError({ response });
        }
        if (response.body) {
            return response.text();
        }
        throw new IaApiError(`Empty body`, { response });
    }
}

export default IaCatalogTask;