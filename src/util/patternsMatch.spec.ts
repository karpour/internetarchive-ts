import { expect } from "chai";
import { patternMatch, patternsMatch } from "./patternsMatch.js";

describe("patternMatch.ts", () => {
    it("patternMatch", () => {
        expect(patternMatch("foo.txt", "*.txt")).to.be.true;
        expect(patternMatch("src/utils/file.ts", "src/**/*.ts")).to.be.true;
        expect(patternMatch("foo.txt", "*.md")).to.be.false;
        expect(patternMatch("bar.js", "src/**/*.js")).to.be.false;
        expect(patternMatch("abc", "abc")).to.be.true;
        expect(patternMatch("abc", "abcd")).to.be.false;
    });

    it("patternsMatch", () => {
        expect(patternsMatch("anything", [])).to.be.true;
        expect(patternsMatch("foo.txt", ["*.md", "*.txt"])).to.be.true;
        expect(patternsMatch("src/app/main.ts", ["*.js", "src/**/*.ts"])).to.be.true;
        expect(patternsMatch("foo.txt", ["*.md", "src/**/*.ts"])).to.be.false;
        expect(patternsMatch("foo.log", ["*.txt", "!*.log"])).to.be.false;
        expect(patternsMatch("foo.log", ["*.txt", "*.log"])).to.be.true;
        expect(patternsMatch("src/utils/helpers/index.ts", ["src/**/*.ts"])).to.be.true;
    });
});