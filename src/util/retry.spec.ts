import { expect, use } from 'chai';
import { retry } from './retry';


describe('retry.ts', () => {
    it('retry', async () => {

        const chaiAsPromised = (await import('chai-as-promised')).default;
        use(chaiAsPromised);
        let retries = 5;

        const retryFunc = async () => {
            //console.log(`Retry ${retries}`);
            if (--retries > 0) throw new Error(`Failed ${retries}`);
            return "success";
        };

        await expect(retry(() => retryFunc(), 5)).to.eventually.equal("success");

        retries = 10;
        await expect(retry(() => retryFunc(), 5)).to.eventually.be.rejected;
    });
});
