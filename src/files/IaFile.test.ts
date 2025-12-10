import { getItem } from "../api/index.js";

const item = await getItem('stairs');
const file = item.getFile('stairs.avi');
if (file) {
    console.log(`${file.format}, ${file.size}`); // Cinepack, 3786730
}