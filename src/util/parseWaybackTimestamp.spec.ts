import { expect } from "chai";
import { parseWaybackTimestamp } from "./parseWaybackTimestamp.js";

describe("parseWaybackTimestamp.ts", () => {
    it("parseWaybackTimestamp", () => {
        expect(() => parseWaybackTimestamp("20241212121212")).to.not.throw();
        expect(() => parseWaybackTimestamp("20240101010199")).to.throw();
        expect(() => parseWaybackTimestamp("20240101019901")).to.throw();
        expect(() => parseWaybackTimestamp("20240101990101")).to.throw();
        expect(() => parseWaybackTimestamp("20240199010101")).to.throw();
        expect(() => parseWaybackTimestamp("20249901010101")).to.throw();
    });
});