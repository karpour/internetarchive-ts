import { IaItem } from "../item/IaItem";
import IaFile from "./IaFile";

export class IaOnTheFlyFile extends IaFile {
    /**
     * @param item The item that the file is part of.
     * @param name The filename of the file.
     */
    public constructor(item: IaItem, name:string) {
        super(item, name);
    }
}

export default IaOnTheFlyFile;