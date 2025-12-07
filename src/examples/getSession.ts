import { getSession } from '../api/index.js';
import { IaAuthConfig } from '../types/index.js';

async function main() {
    const config:IaAuthConfig = { 's3': { 'access': 'foo', 'secret': 'bar' } };
    const s = getSession(config);

    // From the session object, you can access all of the functionality of the internetarchive lib
    const item = await s.getItem('nasa');
    item.download();


    const tasks = await s.getTasks({ task_id: 31643513 });
    console.log(tasks[0]?.server);
}

main();