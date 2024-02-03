export type IaPageNumbersInfo = {
    identifier: string,
    "format-version": string,
    "archive-hocr-tools-version": string,
    confidence: number,
    pages: {
        leafNum: number,
        confidence: string | number | null,
        pageNumber: string | number | null,
        pageProb: string | number | null,
        wordConf: string | number | null;
    }[];
};