import { IaMetaDataHeaderIndexedKey, IaMetaType } from "../types/IaTypes";
import { replaceUnderScores } from "./replaceUnderScores";
import { leftPad2 } from "./leftPad2";

export function createIaHeaderMetaKey<K extends string, N extends number | undefined, MT extends IaMetaType>(key: K, metaType: MT, idx?: N): IaMetaDataHeaderIndexedKey<K, N, MT> {
  // because rfc822 http headers disallow _ in names, IA-S3 will
  // translate two hyphens in a row (--) into an underscore (_).
  return `x-archive-${metaType}${idx !== undefined ? leftPad2(idx) : ''}-${replaceUnderScores(key)}` as IaMetaDataHeaderIndexedKey<K, N, MT>;
}