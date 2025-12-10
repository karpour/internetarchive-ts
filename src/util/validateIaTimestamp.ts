import { IaTypeError } from "../error/index.js";


export function validateIaTimestamp(timestamp: string) {
    if (!/^\d+$/.test(timestamp)) throw new IaTypeError(`timestamp can only include digits`);
    if (timestamp.length < 4 || timestamp.length > 14) throw new IaTypeError(`timestamp must be between 4 and 14 digits in the format YYYYMMDDHHMMSS`);
}
