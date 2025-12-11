import { expect, use } from "chai";
import express from "express";
import { IaSession } from "./index.js";
import { Server } from "http";
import chaiAsPromised from "chai-as-promised";
use(chaiAsPromised);

describe("IaSession.ts", function () {

    let baseUrl: string;
    let server: Server;
    const session = new IaSession({ general: { secure: false, host: "localhost" } });

    before(async () => {
        const app = express();

        // 1: Normal OK endpoint
        app.get("/ok", (_req: Request, res: any) => {
            res.status(200).send("success");
        });

        // 2: Slow endpoint for timeout testing
        app.get("/slow", async (_req, res) => {
            await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
            res.status(200).send("slow response");
        });

        // 3: Fail the first time, succeed after
        let failCount = 0;
        app.get("/retry", (_req, res) => {
            if (failCount++ === 0) {
                res.status(500).send("fail once");
            } else {
                res.status(200).send("success after retry");
            }
        });

        server = app.listen(0);
        const { port } = server.address() as any;
        baseUrl = `http://localhost:${port}`;
    });

    after(() => server.close());

    it("should successfully fetch a URL", async () => {
        const res = await session['fetch'](`${baseUrl}/ok`, { method: "GET" });
        expect(res.status).to.equal(200);
        const body = await res.text();
        expect(body).to.equal("success");
    });

    it("should timeout when request exceeds timeoutMs", async () => {
        await expect(
            session['fetch'](`${baseUrl}/slow`, { method: "GET" }, 50)
        ).to.be.rejectedWith(/abort|signal|fetch failed/i);
    });

    it("should clear timeout after completion", async () => {
        const res = await session['fetch'](`${baseUrl}/ok`, { method: "GET" }, 100);
        expect(res.status).to.equal(200);
    });

    it("Non-existant url", async () => {
        await expect(session['fetch'](`http://nonexistanturl/retry`, { method: "GET" }, undefined, 1)).to.be.rejectedWith(/fetch failed/);
    });
});