import IaCookieJar from './IaCookieJar.js';

describe('IaCookieJar.ts', () => {
    it('IaCookieJar', async () => {
        const cookies = {
            'logged-in-sig': 'abc123; expires=Sat, 05-Dec-2026 14:02:26 GMT; Max-Age=31536000; path=/; domain=.archive.org; HttpOnly',
            'logged-in-user': 'text%40example.com; expires=Sat, 05-Dec-2026 14:02:26 GMT; Max-Age=31536000; path=/; domain=.archive.org'
        };
        const cookieJar = new IaCookieJar();
        cookieJar.addCookies(cookies);
    });
});