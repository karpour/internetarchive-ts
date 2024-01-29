import { IaFileRotation, IaFileSource } from "../types";
import { IaFileBaseMetadata, IaFileExtendedMetadata, IaFileMetadataRaw } from "../types/IaFileMetadata";
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

// @ts-ignore
export class IaBaseFile<IaFileMeta extends IaFileBaseMetadata = IaFileBaseMetadata> implements IaFileMeta {
    public readonly name: string;

    public readonly metadata: IaFileMeta;

    // Fields from IaFileMetadata
    public readonly size: number;
    public readonly source: IaFileSource;
    public readonly format: string;
    public readonly md5: string;
    public readonly sha1?: string;
    public readonly mtime: number;
    public readonly crc32?: string;
    public readonly otf?: boolean;
    public readonly original?: string;
    public readonly private?: boolean;
    public readonly length?: number;
    public readonly width?: number;
    public readonly height?: number;
    public readonly rotation?: IaFileRotation;

    public get identifier(): string {
        return this.item.identifier;
    }

    public constructor(protected item: any, name: string, fileMetadata?: IaFileMetadataRaw<IaFileMeta> | IaFileMeta) {
        this.name = strip(name, '/');

        //fileMetadata ??= item.files?.find(f => { f.name == name; }) as IaFileMetadataRaw<IaFileMeta>;

        if (!fileMetadata) {
            throw new Error(`No File metadata found`);
        }

        this.metadata = convertFileMetadata(fileMetadata);
        this.size = this.metadata.size;
        this.source = this.metadata.source;
        this.format = this.metadata.format;
        this.md5 = this.metadata.md5;
        this.sha1 = this.metadata.sha1;
        this.mtime = this.metadata.mtime;
        this.crc32 = this.metadata.crc32;

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
        });
    }

    public exists(): boolean {
        return (this.metadata !== undefined);
    }
}