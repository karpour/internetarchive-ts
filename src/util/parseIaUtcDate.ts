
export function parseIaUtcDate(dateStr: string): Date {
    return new Date(dateStr.replace(" ", "T") + "Z");
}
