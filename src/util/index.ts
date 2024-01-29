export * from "./extractKeyAndIndex";
export * from "./getMd5";
export * from "./getUserAgent";
export * from "./index";
export * from "./isValidMetadataKey";
export * from "./makeArray";
export * from "./recursiveFileCount";
export * from "./recursiveIterDirectory";
export * from "./validateS3Identifier";

export function patternsMatch(text: string, patterns: string[]): boolean {
    return patterns.find(p => patternMatch(text, p)) !== undefined;
}

export function patternMatch(text: string, pattern: string): boolean {
    
    // TODO
    //return minimatch(text, pattern);
    return false;
}