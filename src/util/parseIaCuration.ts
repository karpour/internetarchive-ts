import { IaTypeError } from "../error";
import { IaCuration, IaParsedCuration } from "../types";

const RegExp_IaCurationDateString = /^(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<hours>\d{2})(?<minutes>\d{2})(?<seconds>\d{2})$/;
export function parseDateString(datestr: string): Date {
    const r = RegExp_IaCurationDateString.exec(datestr);
    if (r && r.groups) {
        const { year, month, day, hours, minutes, seconds } = r.groups;
        const parsedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }
    throw new IaTypeError(`Date string can not be parsed: "${datestr}"`);
}

export const RegExp_IaCuration = /^\[curator\](?<curator>.*)\[\/curator\]\[date\](?<datestring>\d{14})\[\/date\](?:\[state\](?<state>dark|approved|freeze|un-dark)\[\/state\])?\[comment\](?<comment>.*)\[\/comment\]$/;

export default function parseIaCuration<C extends IaCuration>(curation: C): IaParsedCuration<C> {
    const r = RegExp_IaCuration.exec(curation);
    if (!r || !r.groups) throw new IaTypeError(`Curation string can not be parsed: "${curation}"`);
    return {
        curator: r.groups.curator!,
        date: parseDateString(r.groups.datestring!),
        comment: r.groups.comment!,
        state: r.groups.state
    } as IaParsedCuration<C>;
}
