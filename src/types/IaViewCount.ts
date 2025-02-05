import { Prettify } from "./IaTypes";

/**
* This type represents the return value of the TODO api endpoint
 */
export type IaShortViewcounts<T extends string> = {
    [key in T]: IaShortViewCountItem
};

/**
 * This type represents an entry in the {@link IaShortViewCountItem} type
 */
export type IaShortViewCountItem = {
    all_time: number,
    have_data: boolean,
    last_30day: number,
    last_7day: number;
};

/**
 * This type represents the return value of the TODO api endpoint
 */
export type IaLongViewcounts<T extends string> = {
    days: string[],
    ids: {
        [key in T]: IaLongViewCountItem
    };
};

export type IaLongViewCountItemDetails = {
    per_day: number[];
    previous_days_total: number,
    sum_per_day_data: number;
};

export type IaLongViewCountItem = Prettify<IaShortViewCountItem & {
    detail: {
        non_robot: IaLongViewCountItemDetails,
        pre2017: IaLongViewCountItemDetails,
        pre_20170101_total: number,
        robot: IaLongViewCountItemDetails,
        unrecognized: IaLongViewCountItemDetails,
    },
}>;