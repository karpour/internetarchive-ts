// The internetarchive module is a Python/CLI interface to Archive.org.
//
// Copyright (C) 2012-2019 Internet Archive
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { IaApiGetRateLimitResult, IaApiGetTasksResult, IaGetTasksBasicParams, IaGetTasksParams, IaSubmitTaskParams } from "../types";
import IaSession from "../session/IaSession";
import { IaTaskSummary, IaTaskType } from "../types/IaTask";
import IaCatalogTask from "./IaCatalogTask";
import { handleIaApiError } from "../util/handleIaApiError";
import { getApiResultValue } from "../util/getApiResultValue";
import { Readable } from "stream";
import readline from "readline";
import { arrayFromAsyncGenerator } from "../util/arrayFromAsyncGenerator";
import { TODO } from "../todotype";

export function getSortByDate(task: IaCatalogTask): Date {
    if (task.category === 'summary') {
        return new Date();
    }
    return new Date(task.submittime);
}

/**
 * This class represents the Archive.org catalog.
 * You can use this class to access and submit tasks from the catalog.
 * 
 * This is a low-level interface, and in most cases the functions
 * in the `internetarchive-ts` module and methods in
 * {@link IaSession} should be used.
 * 
 * It uses the archive.org
 * {@link https://archive.org/services/docs/api/tasks.html | Tasks API}
 * 
 * @example
 * from internetarchive import {getSession, Catalog} from "internetarchive-ts";
 * const s = getSession();
 * const c = new Catalog(s);
 * tasks = c.getTasks('nasa');
 */
export class IaCatalog {
    protected readonly url: string;

    /**
     * Initialize Catalog object.
     * @param session An ArchiveSession object.
     */
    public constructor(
        public readonly session: IaSession,
    ) {
        this.url = `${this.session.url}/services/tasks.php`;
        //log.verbose(`New Catalog object created`);
    }

    /**
     * Make a GET request to the {@link https://archive.org/services/docs/api/tasks.html | Tasks API}
     * @param params Query parameters
     * @returns Response
     * @throws {IaApiBadRequestError}
     * @throws {IaApiUnauthorizedError}
     * @throws {IaApiNotFoundError}
     * @throws {IaApiMethodNotAllowedError}
     * @throws {IaApiTooManyRequestsError}
     * @throws {IaApiError}
     */
    protected async makeTasksRequest<T extends IaApiGetTasksResult | IaApiGetRateLimitResult<any>>(params: IaGetTasksParams = {}): Promise<T> {
        const response = await this.session.get(this.url, { params });
        if (response.ok) {
            return getApiResultValue<T>(response);
        } else {
            throw await handleIaApiError({ response });
        }
    }

    /**
     * Get the total counts of catalog tasks meeting all criteria, organized by run status (queued, running, error, and paused).
     * Important: If the supplied identifier does not exist, this method does not fail!
     * @param identifier Item identifier. Both * (asterisk) and % (percentage sign) may be used as wildcard characters within criteria that accept them.
     * @param params Query parameters
     * @returns the total counts of catalog tasks meeting all criteria
     * @throws {IaApiError}
     */
    public async getSummary(identifier: string, params: Omit<IaGetTasksBasicParams, 'summary' | 'history' | 'catalog' | 'identifier'> = {}): Promise<IaTaskSummary> {
        const getTaskParams: IaGetTasksParams = {
            ...params,
            summary: 1,
            history: 0,
            catalog: 0,
            identifier
        };
        const result = await this.makeTasksRequest<IaApiGetTasksResult>(getTaskParams);
        return result.summary!;
    }



    /**
     * A generator that can make arbitrary requests to the Tasks API. It handles paging (via cursor) automatically.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An AsyncGenerator that yields {@link IaCatalogTask} objects
     */
    public async *iterTasks(params: IaGetTasksParams = {}): AsyncGenerator<IaCatalogTask> {
        let cursor: string | undefined = params.cursor;

        do {
            const result = await this.makeTasksRequest<IaApiGetTasksResult>(params);
            for (const row of result.catalog ?? []) {
                yield new IaCatalogTask(row, this);
            }
            for (const row of result.history ?? []) {
                yield new IaCatalogTask(row, this);
            }
            cursor = result.cursor;
        } while (cursor);
    }

    /**
     * Returns rate limit for specified task type
     * @param cmd Task type
     * @returns Rate limit object
     * @throws {IaApiError}
     * @throws {IaApiUnauthorizedError}
     */
    public async getRateLimit<T extends IaTaskType>(cmd: IaTaskType = 'derive.php'): Promise<IaApiGetRateLimitResult<T>> {
        const params = { rate_limits: 1, cmd };
        const result = await this.makeTasksRequest<IaApiGetRateLimitResult<T>>(params);
        return result;
    }

    /**
     * Get a list of all tasks meeting all criteria. 
     * The list is ordered by submission time.
     * @param params.task_id
     * @param params.server
     * @param params.cmd
     * @param params.args
     * @param params.submitter
     * @param params.priority
     * @param params.wait_admin
     * // TODO change to submittime_gt, etc...
     * @param params'submittime>'
     * @param params'submittime<'
     * @param params'submittime>='
     * @param params'submittime<='
     * @param params.cursor
     * @param params.catalog
     * @param params.history
     * @param params.identifier The item identifier, if provided will return tasks for only this item filtered by other criteria provided in params.
     * @returns A list of all tasks meeting all criteria.
     */
    public async getTasks(params: Omit<IaGetTasksParams, 'limit' | 'summary'> = {}): Promise<IaCatalogTask[]> {
        return arrayFromAsyncGenerator(this.iterTasksNoLimit(params));
    }

    public async *iterTasksNoLimit(params: Omit<IaGetTasksParams, 'limit' | 'summary'> = {}): AsyncGenerator<IaCatalogTask> {
        const getTasksParams: IaGetTasksParams = {
            catalog: 1,
            history: 1,
            ...params,
            summary: 0,
            limit: 0
        };
        const response = await this.session.get(this.url, { params: getTasksParams });

        const rl = readline.createInterface({
            input: Readable.fromWeb(response.body as any),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            yield new IaCatalogTask({ ...JSON.parse(line) }, this);
        }
    }

    /**
     * Submit a task
     * @param {IaSubmitTaskParams} param0 Options
     * @param param0.identifier Item identifier
     * @param param0.cmd Task command to submit. See {@link https://archive.org/services/docs/api/tasks.html#supported-tasks | Supported task commands}
     * @param param0.comment A reasonable explanation for why the task is being submitted
     * @param param0.priority Task priority from 10 to -10
     * @param param0.data Extra POST data to submit with the request. Refer to {@link https://archive.org/services/docs/api/tasks.html#request-entity | Tasks API Request Entity}
     * @param param0.headers Additional headers to add to the request
     * @returns Response
     */
    public submitTask({
        identifier,
        cmd,
        comment,
        priority = 0,
        data = {},
        headers = {}
    }: IaSubmitTaskParams): Promise<Response> {
        const _data:TODO = {
            ...data,
            cmd,
            identifier,
            priority,
        };
        if (comment) {
            _data.args ??= {};
            _data.args.comment = comment;
        }
        return this.session.post(this.url, {
            body: JSON.stringify(_data),
            headers
        });
    }
}

export default IaCatalog;