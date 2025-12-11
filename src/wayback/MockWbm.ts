import express from "express";
import { Server } from "http";
import { sleepMs } from "../util/index.js";
import { expect } from "chai";

export type MockEndpointData = {
    expectedHeaders?: Record<string, string>;
    expectedQuery?: Record<string, string>;
    responseData: string;
    responseHeaders?: Record<string, string>;
    responseCode?: number;
    timeoutMs?: number;
};

export type MockCallbackFunction = (req: any, res: any) => any;

export type MockServerOptions = {
    printDebug?: boolean;
};

export class MockServer {
    private app: ReturnType<typeof express>;
    private server: Server;
    public readonly baseUrl: string;
    protected debug = (message: any) => { };

    public callbacks: Record<string, MockCallbackFunction> = {};

    public constructor({
        printDebug = false
    }: MockServerOptions = {}) {
        if (printDebug) this.debug = (message: any) => console.log(message);

        this.app = express();
        const self = this;
        this.app.all('/*splat', async (req, res) => {
            console.log(req.url);
            const cb = this.callbacks[req.url];
            if (!cb) throw new Error(`No callback defined for path "${req.url}"`);
            const returnData = await cb(req, res);

            res.end(returnData);
        });
        this.server = this.app.listen(0);
        const { port } = this.server.address() as any;
        this.baseUrl = `localhost:${port}`;
        console.log(`http://${this.baseUrl}`);
    }

    public mockEndpoint(path: string, m: MockEndpointData) {
        const {
            expectedHeaders = {},
            expectedQuery = {},
            responseData,
            responseHeaders = {},
            responseCode,
            timeoutMs,
        } = m;

        const callbacks = this.callbacks;

        console.log(`Added callback ${path}`);
        callbacks[path] = async (req: any, res: any) => {
            this.debug(`Request to ${path}`);
            this.debug("Headers");
            this.debug(req.headers);
            for (let [key, value] of Object.entries(expectedHeaders)) {
                expect(req.headers.get(key)).to.equal(value, `Header mismatch for header "${key}" on endpoint ${req.url}`);
            }
            if (req.query) {
                this.debug("Query");
                this.debug(req.query);
            }
            for (let [key, value] of Object.entries(expectedQuery)) {
                expect(req.query[key]).to.equal(value, `Query param mismatch for query param "${key}" on endpoint ${req.url}`);
            }


            if (timeoutMs) {
                this.debug(`Sleeping ${timeoutMs}ms`);
                await sleepMs(timeoutMs);
            }


            if (responseCode) {
                this.debug(`Response Code ${responseCode}`);
                res.status(responseCode);
            }

            this.debug(`Response Headers`);
            this.debug(responseHeaders);
            for (let [key, value] of Object.entries(responseHeaders)) {
                res.header(key, value);
            }
            delete callbacks[path];
            return responseData;
        };
    }

    public close() {
        this.server.close();
    }
}

async function main() {
    const wbm = new MockServer({ printDebug: true });

    wbm.mockEndpoint("/data", {
        responseData: "BLA"
    });

}

//main();