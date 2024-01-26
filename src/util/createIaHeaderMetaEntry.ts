import { NoUnderscoreString, replaceUnderScores } from "../types/IaTypes";

/** Header Entry for setting a meta value */
export type IaHeaderMetaEntry<T extends string, V extends string> = `x-archive-meta-${NoUnderscoreString<T>}:${V}`;

export function createIaHeaderMetaEntry<K extends string, V extends string>(key: K, value: V): IaHeaderMetaEntry<K, V> {
  // TODO replace newlines, trim
  return `x-archive-meta-${replaceUnderScores(key)}:${value}`;
}
