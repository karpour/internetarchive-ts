import { IaBaseMetadataType, IaMetadataRaw, Prettify } from "./IaTypes";




/** 
 * Converts an array index to a flat key using the provided KEY parameter
 * 
 * If IDX is zero, the type will be just be KEY.
 * If IDX is above zero, the resulting type will be `${KEY}[${IDX}]`.
 * @example
 * FlattenedArrayKey<"a", 1> // results in "a[1]"
 * @template {string} KEY Key name
 * @template {number} IDX Array index
 */
type FlattenedArrayKey<KEY extends string, IDX extends `${number}`> = IDX extends 0 ? KEY : `${KEY}[${IDX}]`;

type AddFlattenedKeys<KEY extends string, T extends string[]> = {
    [K in keyof T as K extends `${0}` ? KEY : (K extends `${number}` ? FlattenedArrayKey<KEY, K> : never)]: T[K];
} & {};

type FlattenedArrays<T extends { [key: string]: string | string[]; }> = {
    [K in keyof T]: T[K] extends string[] ? (
        K extends string ?
        AddFlattenedKeys<K, T[K]> :
        never
    ) : T[K];
};

export type RawifiedMetadata<T extends IaBaseMetadataType> = Prettify<DeepFlatten<FlattenedArrays<IaMetadataRaw<T>>>>;

type ValuesOf<T> = T[keyof T];
type ObjectValuesOf<T> = Exclude<
    Extract<ValuesOf<T>, object>,
    Array<any>
>;

type UnionToIntersection<U> = (U extends any
    ? (k: U) => void
    : never) extends ((k: infer I) => void)
    ? I
    : never;

type NonObjectKeysOf<T> = {
    [K in keyof T]: T[K] extends Array<any> ?
    K :
    T[K] extends object ? never : K
}[keyof T];

type DFBase<T, Recursor> = Pick<T, NonObjectKeysOf<T>> &
    UnionToIntersection<Recursor>;

type DeepFlatten<T> = T extends any ? DFBase<T, DF2<ObjectValuesOf<T>>> : never;
type DF2<T> = T extends any ? DFBase<T, ObjectValuesOf<T>> : never;
