import { AttachmentError, KIXObjectType, SysConfigKey, SysConfigItem } from "../model";
import { KIXObjectService } from "./kix";

export class AttachmentUtil {

    public static async checkFile(file: File, mimeTypes?: string[]): Promise<AttachmentError> {
        let error;
        const fileSizeOK = await AttachmentUtil.checkFileSize(file);
        if (!fileSizeOK) {
            error = AttachmentError.MAX_FILE_SIZE_EXCEEDED;
        } else if (mimeTypes && mimeTypes.length && !AttachmentUtil.checkMimeType(file, mimeTypes)) {
            error = AttachmentError.INVALID_MIMETYPE;
        }
        return error;
    }

    public static async checkFileSize(file: File): Promise<boolean> {
        const maxSize = await AttachmentUtil.getMaxUploadFileSize();
        if (maxSize) {
            if (file.size <= maxSize) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }

    public static async getMaxUploadFileSize(): Promise<number> {
        const maxUploadFileSize = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.MAX_ALLOWED_SIZE]
        );
        return maxUploadFileSize && maxUploadFileSize.length ? maxUploadFileSize[0].Data : null;
    }

    public static checkMimeType(file: File, mimeTypes: string[]): boolean {
        const index = mimeTypes.findIndex((mt) => mt === file.type);
        return index !== -1;
    }

    // tslint:disable:max-line-length
    public static async buildErrorMessages(fileErrors: Array<[File, AttachmentError]>): Promise<string[]> {
        const errorMessages = [];
        const maxFileSize = await AttachmentUtil.getMaxUploadFileSize();
        const maxFileSizeString = AttachmentUtil.getFileSize(maxFileSize, 0);
        fileErrors.forEach((fe) => {
            switch (fe[1]) {
                case AttachmentError.MAX_FILE_SIZE_EXCEEDED:
                    errorMessages.push(
                        `Die Datei ${fe[0].name} ist zu groß (${AttachmentUtil.getFileSize(fe[0].size)}). Maximal mögliche Dateigröße: ${maxFileSizeString}.`
                    );
                    break;
                case AttachmentError.INVALID_MIMETYPE:
                    errorMessages.push(
                        `Die Datei ${fe[0].name} hat keinen gültigen MIME-TYPE.`
                    );
                    break;
                default:
                    errorMessages.push(fe[1] + ": " + fe[0]);
            }
        });
        return errorMessages;
    }
    // tslint:enable:max-line-length

    public static getFileSize(fileSize: number, decPlaces: number = 1): string {
        let sizeString = fileSize + ' Byte';
        const siteUnits = ["kB", "MB", "GB"];
        for (
            let newSize = fileSize / 1000, sizeUnit = 0;
            newSize >= 1 && sizeUnit < 3;
            newSize /= 1000, sizeUnit++
        ) {
            sizeString = newSize.toFixed(decPlaces) + " " + siteUnits[sizeUnit];
        }
        return sizeString;
    }

    public static isAttachmentObject(object: any): boolean {
        return object
            && object.hasOwnProperty('AttachmentID')
            && object.hasOwnProperty('Filename')
            && object.hasOwnProperty('ContentType');
    }
}
