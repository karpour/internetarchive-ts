import { IaTypeError } from "../error";
import { IaItem } from "../item/IaItem";
import { IaBaseMetadataType, IaFileRotation, IaFileSource } from "../types";
import { IaFileBaseMetadata, IaFileExtendedMetadata, IaFileMetadataRaw, IaFileSourceMetadata } from "../types/IaFileMetadata";
import { strip } from "../util/strip";
function convertBooleanString(boolString?: string | boolean): boolean | undefined {
    if (typeof (boolString) === 'boolean') return boolString;
    return boolString ? boolString.toLowerCase() === 'true' : undefined;
}

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
}

export class IaBaseFile<IaFileMeta extends IaBaseMetadataType = IaFileExtendedMetadata> {
    public readonly name: string;

    public get size(): number {
        return parseInt(this.metadata.size as string),
    }
    public get mtime(): number {
        return parseInt(this.metadata.mtime as string);
    }
    public get source(): IaFileSource {

        return this.metadata.source as IaFileSource;
    }

    public get otf(): boolean {
        return convertBooleanString(this.metadata.otf) ?? false;
    }
    public get private(): boolean {
        return convertBooleanString(this.metadata.private) ?? false;
    }
    public get length(): number | undefined {
        return convertInt(this.metadata.length);
    }
    public get width(): number | undefined {
        return convertInt(this.metadata.width);
    }
    public get height(): number | undefined {
        return convertInt(this.metadata.height);
    }
    public get rotation(): IaFileRotation {
        return this.metadata.rotation as IaFileRotation;
    }

    public get identifier(): string {
        return this.item.identifier;
    }

    public constructor(protected item: IaItem, name: string, public readonly metadata: IaFileSourceMetadata<IaFileMeta>) {
        this.name = strip(name, '/');

        //fileMetadata ??= item.files?.find(f => { f.name == name; }) as IaFileMetadataRaw<IaFileMeta>;

        if (!metadata) {
            throw new IaTypeError(`IaBaseFile was instantiated with missing metadata.`);
        }

        this.metadata = convertFileMetadata<IaFileMeta>(fileMetadata);
        this.size = this.metadata.size;
        this.source = this.metadata.source;
        this.format = this.metadata.format;
        this.md5 = this.metadata.md5;
        this.sha1 = this.metadata.sha1;
        this.mtime = this.metadata.mtime;
        this.crc32 = this.metadata.crc32;

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