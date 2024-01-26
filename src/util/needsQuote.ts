export function needsQuote(s: string): boolean {
    return !/^[\p{ASCII}]+$/u.test(s) || /\s/.test(s);
}