/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AttachmentError } from '../../../../model/AttachmentError';
import { KIXObjectService } from './KIXObjectService';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';


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
        const maxUploadFileSize = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.MAX_ALLOWED_SIZE]
        );
        return maxUploadFileSize && maxUploadFileSize.length ? maxUploadFileSize[0].Value : null;
    }

    // TODO: byte-sequenz mal mit prüfen
    public static checkMimeType(file: File, mimeTypes: string[]): boolean {
        return mimeTypes.some((mt) => {
            if (mt === '') {
                return mt === file.type;
            } else {
                return !!file.type.match(new RegExp(mt));
            }
        });
    }

    // tslint:disable:max-line-length
    public static async buildErrorMessages(fileErrors: Array<[File, AttachmentError]>): Promise<string[]> {
        const errorMessages = [];
        const maxFileSize = await AttachmentUtil.getMaxUploadFileSize();
        const maxFileSizeString = AttachmentUtil.getFileSize(maxFileSize, 0);
        for (const fe of fileErrors) {
            switch (fe[1]) {
                case AttachmentError.MAX_FILE_SIZE_EXCEEDED:
                    const fileSizeError = await TranslationService.translate('Translatable#The file size of {0} is too large ({1}). Max.: {2}', [
                        fe[0].name, AttachmentUtil.getFileSize(fe[0].size), maxFileSizeString
                    ]);
                    errorMessages.push(fileSizeError);
                    break;
                case AttachmentError.INVALID_MIMETYPE:
                    const typeError = await TranslationService.translate('Translatable#The file {0} has no valid MIME-TYPE.', [fe[0].name]);
                    errorMessages.push(typeError);
                    break;
                default:
                    errorMessages.push(fe[1] + ': ' + fe[0]);
            }
        }
        return errorMessages;
    }
    // tslint:enable:max-line-length

    public static getFileSize(fileSize: number, decPlaces: number = 1): string {
        let sizeString = fileSize + ' Byte';
        const siteUnits = ['kB', 'MB', 'GB'];
        for (
            let newSize = fileSize / 1000, sizeUnit = 0;
            newSize >= 1 && sizeUnit < 3;
            newSize /= 1000, sizeUnit++
        ) {
            sizeString = newSize.toFixed(decPlaces) + ' ' + siteUnits[sizeUnit];
        }
        return sizeString;
    }

    public static isAttachmentObject(object: any): boolean {
        return object
            && Object.prototype.hasOwnProperty.call(object, 'AttachmentID')
            && Object.prototype.hasOwnProperty.call(object, 'Filename')
            && Object.prototype.hasOwnProperty.call(object, 'ContentType');
    }
}
