import { NoUnderscoreString } from "../types/IaTypes.js";

export function replaceUnderScores<T extends string>(str: T): NoUnderscoreString<T> {
  return str.replaceAll('_', "--") as NoUnderscoreString<T>;
}
