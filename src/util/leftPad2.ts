import { IaTypeError } from "../error";
import { LeftPad2 } from "../types";

export function leftPad2<N extends number>(num: N): LeftPad2<N> {
    if (Number.isNaN(num) || !Number.isInteger(num) || num < 0) {
        throw new IaTypeError(`Invalid number for leftPad2: ${num}`);
    }
    const numString = `${num}`;
    if (numString.includes('.') || numString.includes('e') || numString.includes('-')) throw new IaTypeError(`Header key index must be positive integer, value="${numString}"`);
    return numString.padStart(2, '0') as LeftPad2<N>;
}