
/**
 * Converts a Date object to a 14-digit IA timestamp in the format yyyyMMddhhmmss 
 * @param date Date to convert
 * @returns Timestamp string
 */
export function dateToIaTimestamp(date: Date) {
    return date.toISOString().substring(0, 19).replace(/[T\-\:\s]/g, "");
}