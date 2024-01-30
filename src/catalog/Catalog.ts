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

import { IaApiGetRateLimitResult, IaApiGetTasksResult, IaApiJsonResult, IaGetTasksBasicParams, IaGetTasksParams, IaSubmitTaskParams } from "../types";
import IaSession from "../session/IaSession";
import { IaTaskSummary, IaTaskType } from "../types/IaTask";
import CatalogTask from "./CatalogTask";
import {
    IaApiError, IaApiUnauthorizedError
} from "../error";
import { handleIaApiError } from "../util/handleIaApiError";
import log from "../logging/log";

export function getSortByDate(task: CatalogTask): Date {
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
export class Catalog {
    protected url: string;

    /**
     * Initialize Catalog object.
     * @param session An ArchiveSession object.
     */
    public constructor(
        public readonly session: IaSession,
    ) {
        this.url = `${this.session.url}/services/tasks.php`;
        log.verbose(`New Catalog object created`);
    }

    /**
     * Get the total counts of catalog tasks meeting all criteria, organized by run status (queued, running, error, and paused).
     * @param identifier Item identifier. Both * (asterisk) and % (percentage sign) may be used as wildcard characters within criteria that accept them.
     * @param params Query parameters
     * @returns the total counts of catalog tasks meeting all criteria
     * @throws {IaApiError}
     * 
     */
    public async getSummary(identifier: string | undefined = undefined, params: IaGetTasksBasicParams = {}): Promise<IaTaskSummary> {
        const getTaskParams: IaGetTasksParams = {
            ...params,
            summary: 1,
            history: 0,
            catalog: 0,
            identifier
        };
        const response = await this.makeTasksRequest(getTaskParams);
        const json = await response.json();
        if (json.success === true) {
            return json.value?.summary;
        } else {
            return new IaApiError(json.error ?? "getSummary request failed", { response });
        }
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
    public async makeTasksRequest(params: IaGetTasksParams = {}): Promise<Response> {
        const response = await this.session.get(this.url, { params });
        if (response.ok) {
            return response;
        } else {
            throw await handleIaApiError(response);
        }
    }

    /**
     * A generator that can make arbitrary requests to the Tasks API. It handles paging (via cursor) automatically.
     * @param params Query parameters, refer to {@link https://archive.org/services/docs/api/tasks.html | Tasks API} for available parameters.
     * @returns An AsyncGenerator that yields {@link CatalogTask} objects
     */
    public async *iterTasks(params: IaGetTasksParams = {}): AsyncGenerator<CatalogTask> {
         let cursor: string | undefined = params.cursor;

        do {
            const response = await this.makeTasksRequest(params);
            const json = await response.json() as IaApiJsonResult<IaApiGetTasksResult>;
            for (const row of json.value?.catalog ?? []) {
                yield new CatalogTask(row, this);
            }
            for (const row of json.value?.history ?? []) {
                yield new CatalogTask(row, this);
            }
            cursor = json.value?.cursor;
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
        const result = await this.makeTasksRequest(params);
        const json = await result.json() as IaApiJsonResult<IaApiGetRateLimitResult<T>>;
        if (!result.ok) {
            throw await handleIaApiError(result);
        }
        if (json.success) {
            return json.value;
        } else {
            log.error(JSON.stringify(json));
            throw new IaApiError(json.error);
        }
        /*
        let line = '';
        tasks = [];
        for c in r.iterContent():
            c = c.decode('utf-8');
            if c == '\n':
                j = json.loads(line);
            task = CatalogTask(j, self);
            tasks.append(task);
            line = '';
            line += c;
        j = json.loads(line);
        return j;*/
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
     * @param params.limit
     * @param params.cursor
     * @param params.summary
     * @param params.catalog
     * @param params.history
     * @param params.identifier The item identifier, if provided will return tasks for only this item filtered by other criteria provided in params.
     * @returns A list of all tasks meeting all criteria.
     */
    public async getTasks(params: IaGetTasksParams = {}): Promise<CatalogTask[]> {
        params.limit = 0;
        params.summary ??= 0;
        params.catalog ??= 1;
        params.history ??= 1;
        const response = await this.makeTasksRequest(params);
        let line = '';
        let tasks: CatalogTask[] = [];
        console.log(`getTasks response body`);
        console.log(response.body);
        // TODO implement
        /*
        for await(const c of r.iterContent():
            c = c.decode('utf-8');
            if c == '\n':
                j = json.loads(line);
                task = CatalogTask(j, self);
                tasks.append(task);
                line = '';
                line += c;
                if line.strip():
                    j = json.loads(line);
                task = CatalogTask(j, self);
                tasks.append(task);

        allTasks = sorted(tasks, key = sortByDate, reverse = True);*/
        return tasks;
    }

    /**
     * Submit an archive.org task.
     * @param param0 Options
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
        const _data = {
            ...data,
            cmd,
            identifier,
            priority,
        };
        if (comment) {
            data.args ??= {};
            data.args.comment = comment;
        }
        return this.session.post(this.url, {
            body: JSON.stringify(_data),
            headers
        });
    }
}

export default Catalog;