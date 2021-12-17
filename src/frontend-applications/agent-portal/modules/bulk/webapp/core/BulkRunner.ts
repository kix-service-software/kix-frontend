/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { CreateLinkDescription } from '../../../links/server/api/CreateLinkDescription';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class BulkRunner {

    public static async run(
        objects: KIXObject[], objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, linkDescriptions: CreateLinkDescription[]
    ): Promise<[KIXObject[], KIXObject[]]> {
        const finishedObjects: KIXObject[] = [];
        const errorObjects: KIXObject[] = [];

        let cancelBulkProcess: boolean = false;
        const cancelBulk = (): void => {
            cancelBulkProcess = true;
        };

        const editText = await TranslationService.translate('Translatable#edited');

        const objectName = await LabelService.getInstance().getObjectName(objectType, true);
        BrowserUtil.toggleLoadingShield(
            'BULK_SHIELD', true,
            `${finishedObjects.length}/${objects.length} ${objectName} ${editText}`,
            0,
            cancelBulk.bind(this)
        );

        const objectTimes: number[] = [];

        for (const object of objects) {

            if (Array.isArray(linkDescriptions) && linkDescriptions.length) {
                parameter.push([KIXObjectProperty.LINKS, linkDescriptions]);
            }

            const start = Date.now();
            let end: number;
            await KIXObjectService.updateObject(objectType, parameter, object.ObjectId, false)
                .then(() => {
                    finishedObjects.push(object);

                })
                .catch(async (error) => {
                    errorObjects.push(object);

                    const errorText = await TranslationService.translate('Translatable#An error occurred.');
                    BrowserUtil.toggleLoadingShield('BULK_SHIELD', true, errorText);
                    end = Date.now();
                    await this.handleObjectEditError(
                        object, (finishedObjects.length + errorObjects.length), objects.length, cancelBulk
                    );
                });

            if (cancelBulkProcess) {
                break;
            }

            if (!end) {
                end = Date.now();
            }

            await this.setLoadingInformation(
                objectType, objectTimes, start, end, finishedObjects.length, objects.length, cancelBulk
            );
        }

        return [finishedObjects, errorObjects];
    }

    private static async setLoadingInformation(
        objectType: KIXObjectType | string, objectTimes: number[], start: number, end: number,
        finishedCount: number, objectCount: number, cancelBulk: () => void
    ): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(objectType, true);
        objectTimes.push(end - start);
        const average = BrowserUtil.calculateAverage(objectTimes);
        const time = average * (objectCount - finishedCount);

        const editText = await TranslationService.translate('Translatable#edited');
        BrowserUtil.toggleLoadingShield(
            'BULK_SHIELD', true, `${finishedCount}/${objectCount} ${objectName} ${editText}`, time,
            cancelBulk
        );
    }

    private static handleObjectEditError(
        object: KIXObject, finishedCount: number, objectCount: number, cancelBulk: () => void
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const oName = await LabelService.getInstance().getObjectName(object?.KIXObjectType);
            const identifier = await LabelService.getInstance().getObjectText(object);

            const confirmText = await TranslationService.translate(
                'Translatable#Changes cannot be saved. How do you want to proceed?'
            );

            const cancelButton = await TranslationService.translate('Translatable#Cancel');
            const ignoreButton = await TranslationService.translate('Translatable#Ignore');
            BrowserUtil.openConfirmOverlay(
                `${finishedCount}/${objectCount}`,
                `${oName} ${identifier}: ` + confirmText,
                () => resolve(),
                cancelBulk,
                [ignoreButton, cancelButton],
                undefined, undefined, true
            );
        });
    }

}