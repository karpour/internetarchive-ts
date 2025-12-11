import WaybackMachine from "./WaybackMachine.js";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { MockServer } from "./MockWbm.js";
import { IaAuthConfig } from "../types/IaTypes.js";
import { readFileSync } from "fs";
import { IaApiUnauthorizedError } from "../error/index.js";
use(chaiAsPromised);



describe("WaybackMachine.ts", function () {
    this.timeout(30000);
    let wbm: WaybackMachine;
    let wbmLoggedOut: WaybackMachine;
    let config: IaAuthConfig;

    before(async () => {
        config = JSON.parse(readFileSync("ia.json") as any);
        wbm = new WaybackMachine(config);
        wbmLoggedOut = new WaybackMachine();
    });

    after(() => { });

    it("WaybackMachine.getUserStatus", async () => {
        console.log(await wbm.getUserStatus());
        await expect(wbmLoggedOut.getUserStatus()).to.eventually.be.rejectedWith(IaApiUnauthorizedError);
    });

    it("WaybackMachine.getJobStatus", async () => {
        console.log(await wbm.getJobStatus("0"));
    });

    it("WaybackMachine.getAvailability", async () => {
        const giga20050505 = {
            available: true,
            status: "200",
            timestamp: "20050512033008",
            url: "http://web.archive.org/web/20050512033008/http://giga.de:80/"
        };
        const giga2005 = {
            available: true,
            status: "200",
            timestamp: "20050115084404",
            url: "http://web.archive.org/web/20050115084404/http://www.giga.de:80/"
        };
        await expect(wbm.getAvailability("www.giga.de").then(response => response?.available)).to.eventually.equal(true);
        await expect(wbm.getAvailability("www.giga.de", new Date("2005-05-05"))).to.eventually.deep.equal(giga20050505);
        await expect(wbm.getAvailability("www.giga.de", "20050505")).to.eventually.deep.equal(giga20050505);
        //console.log(await wbm.getAvailability("www.giga.de", "20050505"));
        //console.log(await wbm.getAvailability("www.giga.de", "20050505000000"));
        //console.log(await wbm.getAvailability("www.giga.de", "20050500000000"));
        //console.log(await wbm.getAvailability("www.giga.de", "20050000000000"));
        await expect(wbm.getAvailability("www.giga.de", "20050505000000")).to.eventually.deep.equal(giga20050505);
        await expect(wbm.getAvailability("www.giga.de", "20050000000000")).to.eventually.deep.equal(giga2005);

    });

    it("WaybackMachine.getSystemStatus", async () => {
        console.log(await wbm.getSystemStatus());
    });

    it("WaybackMachine.getUserStatus", async () => {
        console.log(await wbm.getUserStatus());
    });

    it("WaybackMachine.getSnapshotMatches", async () => {
        const matches = await wbm.getSnapshotMatches("https://twitter.com/internetarchive/", {
            fl: ["urlkey", "mimetype", "statuscode", "timestamp"],
            collapse: "timestamp:8",
            from: new Date("2020-01-01"),
            to: new Date("2020-01-11")
        });

        expect(matches.length).to.equal(10);
    });
});