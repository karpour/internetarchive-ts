import { IaBaseMetadataType, IaMetaDataHeaders, Prettify } from "./IaTypes.js";

type ccc = Prettify<IaMetaDataHeaders<{
    a: "aa",
    b: [1, 2, 3, "sss", 444, true];
    c: string | undefined;
}, 'meta'>>;
