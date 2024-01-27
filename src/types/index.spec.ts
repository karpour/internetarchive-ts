import { IaBaseMetadataType, IaMetaDataHeaders } from "./IaTypes";

export type testmeta = {
    a: string;
    b: number | number[];
};

const a: IaBaseMetadataType = {
    a: "aa",
    b: [1, 2, 3]
};

const b: testmeta = {
    a: "aa",
    b: [1, 2, 3]
};

type ccc = IaMetaDataHeaders<{
    a: "aa",
    b: [1, 2, 3, "sss", 444, true];
    c: string | undefined;
}, 'meta'>;
