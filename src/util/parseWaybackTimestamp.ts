import { IaTypeError } from "../error";
import { dateToYYYYMMDDHHMMSS } from "./dateToYYYYMMDDHHMMSS";

export function parseWaybackTimestamp(timestampString: string): Date {
    const RegExp_Wayback_Timestamp = /^(?<year>\d\d\d\d)(?<month>\d\d)(?<day>\d\d)(?<hour>\d\d)(?<minutes>\d\d)(?<seconds>\d\d)/;
    const r = timestampString.match(RegExp_Wayback_Timestamp);
    if (r?.groups) {
        const g = r.groups;
        const year = parseInt(g.year!);
        const month = parseInt(g.month!) - 1;
        const day = parseInt(g.day!);
        const hour = parseInt(g.hour!);
        const minutes = parseInt(g.minutes!);
        const seconds = parseInt(g.seconds!);

        if (seconds > 59) throw new IaTypeError(`can not parse WaybackTimestamp "${timestampString}": seconds > 59`);
        if (minutes > 59) throw new IaTypeError(`can not parse WaybackTimestamp "${timestampString}": minutes > 59`);
        if (hour > 23) throw new IaTypeError(`can not parse WaybackTimestamp "${timestampString}": hour > 23`);

        const date = new Date(Date.UTC(year, month, day, hour, minutes, seconds));

        if (date.getDate() !== day) throw new Error(`can not parse WaybackTimestamp "${timestampString}": day mismatch: ${date.getDate()} !== ${day} - ${dateToYYYYMMDDHHMMSS(date)}`);
        if (date.getMonth() !== month) throw new Error(`can not parse WaybackTimestamp "${timestampString}": month mismatch: ${date.getMonth()} !== ${month} - ${dateToYYYYMMDDHHMMSS(date)}`);
        if (date.getFullYear() !== year) throw new Error(`can not parse WaybackTimestamp "${timestampString}": year mismatch`);

        return date;
    }
    throw new Error(`Not a valid timestamp string: ${timestampString}`);
}