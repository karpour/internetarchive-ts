import { expect } from "chai";
import { isValidMetadataKey } from "./isValidMetadataKey";

describe('isValidMetadataKey.ts', () => {
    it('isValidMetadataKey', async () => {
        for (const key of validXmlKeys) {
            expect(isValidMetadataKey(key), key).to.be.true;
        }
        for (const key of invalidXmlKeys) {
            expect(isValidMetadataKey(key), key).to.be.false;
        }
    });
});

const validXmlKeys = [
    "a",
    "a___",
    "name",
    "aame123",
    "xml123",
    "user-name",
    "xml",
    "x1y2z3",
    "node_1-data"
];

const invalidXmlKeys = [
    "",
    "_abc",
    "A",
    "user.name",
    " ",
    "user name",
    "1abc",
    "-name",
    ".",
    "name!",
    "name@",
    "name#",
    "name$",
    "name%",
    "name&",
    "name*",
    "name,",
    "name:",
    "XmlData",
    "xMlNode",
    "na<me",
    "na>me",
    "na?me",
    "na/me",
    "na\\me",
    "na=me",
    "na+me",
    "na;me",
    "na'me",
    "na\"me",
    "Český",
    "имя",
    "名前",
    "αβγ",
    "_x0A"
];