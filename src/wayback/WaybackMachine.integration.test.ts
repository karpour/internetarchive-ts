import WaybackMachine from "./WaybackMachine.js";

const wbm = new WaybackMachine();

console.log(await wbm.getAvailability("www.giga.de"));
console.log(await wbm.getAvailability("www.giga.de", new Date("2005-05-05")));
console.log(await wbm.getAvailability("www.giga.de", "20050505"));
console.log(await wbm.getAvailability("www.giga.de", "20050000000000"));
console.log(await wbm.getAvailability("www.giga.de", "20050505000000"));

