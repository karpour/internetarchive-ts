import { minimatch } from "minimatch";

export function patternsMatch(text: string, patterns: string[]): boolean {
    if (patterns.length === 0) return true;
    return patterns.find(p => patternMatch(text, p)) !== undefined;
}

export function patternMatch(text: string, pattern: string): boolean {
    return minimatch(text, pattern);
}