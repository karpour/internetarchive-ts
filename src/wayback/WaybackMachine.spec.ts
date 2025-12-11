import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import WaybackMachine from "./WaybackMachine.js";
import { MockServer } from "./MockWbm.js";
use(chaiAsPromised);

type MockWbmRequestData = {
    url: string,
    body: string;
};

describe("WaybackMachine.ts", function () {
    let mockWbm: MockServer;
    let wbm: WaybackMachine;

    before(async () => {
        mockWbm = new MockServer({ printDebug: true });
        wbm = new WaybackMachine({ general: { host: mockWbm.baseUrl, secure: false } });
    });

    after(() => mockWbm.close());

    it("save", async () => {
       // mockWbm.mockEndpoint("/save", { responseData: "bla" });
        //const result = await wbm.save("http://example.com");
    });
});