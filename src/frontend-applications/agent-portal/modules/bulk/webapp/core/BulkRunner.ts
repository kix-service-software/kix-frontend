/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { IKIXObjectService } from '../../../base-components/webapp/core/IKIXObjectService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { LinkObject } from '../../../links/model/LinkObject';
import { CreateLinkDescription } from '../../../links/server/api/CreateLinkDescription';
import { CreateLinkObjectOptions } from '../../../links/server/api/CreateLinkObjectOptions';
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
            const start = Date.now();
            let end: number;
            let updateOK: boolean = true;
            if (parameter?.length) {
                await KIXObjectService.updateObject(objectType, parameter, object.ObjectId, false)
                    .catch(async (error) => {
                        updateOK = false;
                        errorObjects.push(object);
                        const errorText = await TranslationService.translate('Translatable#An error occurred.');
                        BrowserUtil.toggleLoadingShield('BULK_SHIELD', true, errorText);
                        end = Date.now();
                        await this.handleObjectEditError(
                            object, (finishedObjects.length + errorObjects.length), objects.length, cancelBulk
                        );
                    });
            }

            if (updateOK && Array.isArray(linkDescriptions) && linkDescriptions.length) {
                const linkPromises = BulkRunner.createLinks(linkDescriptions, object);
                await Promise.all(linkPromises)
                    .catch(async (error) => {
                        updateOK = false;
                        errorObjects.push(object);
                        const errorText = await TranslationService.translate('Translatable#An error occurred.');
                        BrowserUtil.toggleLoadingShield('BULK_SHIELD', true, errorText);
                        end = Date.now();
                        await this.handleObjectEditError(
                            object, (finishedObjects.length + errorObjects.length), objects.length, cancelBulk,
                            'Translatable#At least one link could not be saved.'
                        );
                    });
            }

            if (cancelBulkProcess) {
                break;
            }

            if (updateOK) {
                finishedObjects.push(object);
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

    private static createLinks(linkDescriptions: CreateLinkDescription<KIXObject>[], object: KIXObject): any[] {
        const linkPromises: any[] = [];
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.LINK_OBJECT);
        linkDescriptions.forEach(async (ld) => {
            const newLinkObject = new LinkObject({
                linkedObjectKey: ld.linkableObject.ObjectId,
                linkedObjectType: ld.linkableObject.KIXObjectType ||
                    object.KIXObjectType !== ld.linkTypeDescription.linkType.Source ?
                    ld.linkTypeDescription.linkType.Source
                    : ld.linkTypeDescription.linkType.Target,
                linkType: ld.linkTypeDescription.linkType,
                isSource: ld.linkTypeDescription.asSource
            } as LinkObject);
            linkPromises.push(service.createObject(
                KIXObjectType.LINK_OBJECT,
                newLinkObject,
                new CreateLinkObjectOptions(object)
            ));
        });
        return linkPromises;
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
        object: KIXObject, finishedCount: number, objectCount: number, cancelBulk: () => void, errorMessage?: string
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const oName = await LabelService.getInstance().getObjectName(object?.KIXObjectType);
            const identifier = await LabelService.getInstance().getObjectText(object);

            const confirmText = await TranslationService.translate(
                errorMessage || 'Translatable#Changes cannot be saved. How do you want to proceed?'
            );

            const cancelButton = await TranslationService.translate('Translatable#Cancel');
            const ignoreButton = await TranslationService.translate('Translatable#Ignore');
            BrowserUtil.openConfirmOverlay(
                `${finishedCount}/${objectCount}`,
                `${oName} ${identifier}: ` + confirmText,
                () => resolve(),
                () => { cancelBulk; resolve(); },
                [ignoreButton, cancelButton],
                undefined, undefined, true
            );
        });
    }

}