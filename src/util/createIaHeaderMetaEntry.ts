import { IaMetaDataHeaderIndexedKey, IaMetaType, NoUnderscoreString, replaceUnderScores } from "../types/IaTypes";
import { leftPad2 } from "./leftPad2";

/** Header Entry for setting a meta value */
export type IaHeaderMetaEntry<T extends string, V extends string> = `x-archive-meta-${NoUnderscoreString<T>}:${V}`;


export function createIaHeaderMetaKey<K extends string, N extends number, MT extends IaMetaType>(key: K, metaType: MT, idx: N): IaMetaDataHeaderIndexedKey<K, N, MT> {
  return `x-archive-${metaType}${leftPad2(idx)}-${replaceUnderScores(key)}`;
}


export function createIaHeaderMetaEntry<K extends string, V extends string>(key: K, value: V): IaHeaderMetaEntry<K, V> {
  // TODO replace newlines, trim
  return `x-archive-meta-${replaceUnderScores(key)}:${value}`;
}
