//import { IaItem } from "../item/IaItem";
//import { strip } from "../utils";
export function strip(str: string, charToStrip: string) {
    while (str.length > 0 && charToStrip.indexOf(str.charAt(0)) != -1) {
        str = str.substring(1);
    }
    while (str.length > 0 && charToStrip.indexOf(str.charAt(str.length - 1)) != -1) {
        str = str.substring(0, str.length - 1);
    }
    return str;
}
