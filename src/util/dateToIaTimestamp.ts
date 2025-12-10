export function dateToIaTimestamp(date: Date) {
    return date.toISOString().substring(0, 19).replace(/[T\-\:\s]/g,"")
}