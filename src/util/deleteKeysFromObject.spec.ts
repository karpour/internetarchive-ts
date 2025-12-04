import { expect } from "chai";
import deleteKeysFromObject from "./deleteKeysFromObject";

describe('deleteKeysFromObject.ts', () => {
    it('deleteKeysFromObject', async () => {
        const obj = {
            a: "123",
            b: "345",
            c: {
                d: "123",
                e: "678"
            }
        } as const;
        const objWithDeletedKeys = deleteKeysFromObject(obj, "123");
        type DeletedKeys = typeof objWithDeletedKeys;
        const test: DeletedKeys = {
            b: "345",
            c: {
                e: "678"
            }
        };
        expect(objWithDeletedKeys).to.deep.equal(test);
    });
});