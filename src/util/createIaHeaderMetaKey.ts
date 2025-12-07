import { IaMetaDataHeaderIndexedKey, IaMetaType } from "../types/IaTypes.js";
import { replaceUnderScores } from "./replaceUnderScores.js";
import { leftPad2 } from "./leftPad2.js";
import { IaTypeError } from "../error/index.js";

/**
 * Creates a header key for modifying metadata via http header
 * @see https://archive.org/developers/ias3.html#how-this-is-different-from-normal-s3
 * @param key Key name
 * @param metaType Key type, either `meta` or `filemeta`
 * @param idx Index
 * @returns IA header key
 */
export function createIaHeaderMetaKey<K extends string, N extends number | undefined, MT extends IaMetaType>(key: K, metaType: MT, idx?: N): IaMetaDataHeaderIndexedKey<K, N, MT> {
  if (idx !== undefined && (Number.isNaN(idx) || !Number.isInteger(idx) || idx < 0)) {
    throw new IaTypeError(`Can not create http header key due to invalid idx: "${idx}"`);
  }

  // Because rfc822 http headers disallow _ in names, IA-S3 will
  // translate two hyphens in a row (--) into an underscore (_).
  return `x-archive-${metaType}${idx !== undefined ? leftPad2(idx) : ''}-${replaceUnderScores(key)}` as IaMetaDataHeaderIndexedKey<K, N, MT>;
}