export default function lstrip(str: string, charToStrip: string) {
    while (str.length > 0 && charToStrip.indexOf(str.charAt(0)) != -1) {
        str = str.substring(1);
    }
    return str;
}