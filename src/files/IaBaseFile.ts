import { IaTypeError } from "../error";
import { IaItem } from "../item/IaItem";
import { IaBaseMetadataType, IaFileFormat, IaFileRotation, IaFileSource } from "../types";
import { IaFileBaseMetadata, IaFileExtendedMetadata, IaFileMetadataRaw, IaFileSourceMetadata } from "../types/IaFileMetadata";
import { strip } from "../util/strip";

function convertBooleanString(boolString?: string | boolean): boolean | undefined {
    if (typeof (boolString) === 'boolean') return boolString;
    return boolString ? boolString.toLowerCase() === 'true' : undefined;
}
/*
function convertInt(numberString?: string | number): number | undefined {
    if (numberString === undefined) return undefined;
    return parseInt(numberString as string);
}

function convertFileMetadata<IaFileMeta extends IaFileBaseMetadata>(sourceMetadata: IaFileMetadataRaw<IaFileMeta> | IaFileMeta): IaFileMeta {
    return {
        ...sourceMetadata,
        size: parseInt(sourceMetadata.size as string),
        mtime: parseInt(sourceMetadata.mtime as string),
        source: sourceMetadata.source as IaFileSource,
        otf: convertBooleanString(sourceMetadata.otf),
        private: convertBooleanString(sourceMetadata.private),
        length: convertInt(sourceMetadata.length),
        width: convertInt(sourceMetadata.width),
        height: convertInt(sourceMetadata.height),
        rotation: sourceMetadata.rotation as IaFileRotation,
    } as IaFileMeta;
}*/

export class IaBaseFile<IaFileMeta extends IaBaseMetadataType = IaFileExtendedMetadata> {
    public get name(): string {
        return this.metadata.name;
    }

    public get size(): number {
        return parseInt(this.metadata.size as string);
    }

    public get mtime(): number {
        return parseInt(this.metadata.mtime as string);
    }

    public get source(): IaFileSource {
        return this.metadata.source as IaFileSource;
    }

    public get otf(): boolean {
        return convertBooleanString(this.metadata.otf as string) ?? false;
    }

    public get private(): boolean {
        return convertBooleanString(this.metadata.private as string) ?? false;
    }

    public get format(): IaFileFormat {
        return this.metadata.format;
    }
    public get rotation(): IaFileRotation {
        return this.metadata.rotation as IaFileRotation;
    }

    public get identifier(): string {
        return this.item.identifier;
    }

    public constructor(protected item: IaItem, public readonly metadata: IaFileSourceMetadata<IaFileMeta>) {

        //fileMetadata ??= item.files?.find(f => { f.name == name; }) as IaFileMetadataRaw<IaFileMeta>;

        if (!metadata) {
            throw new IaTypeError(`IaBaseFile was instantiated with missing metadata.`);
        }


        /*
        return new Proxy(this, {
            get: function (target: IaBaseFile<IaFileMeta>, propertyKey: string, receiver?: unknown) {
                const metadata = target.metadata as IaFileMeta;
                console.log(`Proxy method, get "${propertyKey}"`);
                if (metadata[propertyKey]) {
                    console.log(`Found "${propertyKey}=${metadata[propertyKey]}"`);
                    return metadata[propertyKey];
                }
    
                return Reflect.get(target, propertyKey, receiver);
            }
        });*/
    }

    public exists(): boolean {
        return (this.metadata !== undefined);
    }
}