/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ImportExportTemplateRun } from '../../model/ImportExportTemplateRun';
import { ImportExportTemplateRunProperty } from '../../model/ImportExportTemplateRunProperty';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ImportExportTemplateRunLabelProvider extends LabelProvider<ImportExportTemplateRun> {

    public kixObjectType: KIXObjectType = KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(object: ImportExportTemplateRun | KIXObject): boolean {
        return object instanceof ImportExportTemplateRun || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ImportExportTemplateRunProperty.LIST_NUMBER:
                displayValue = 'Translatable#Task Number';
                break;
            case ImportExportTemplateRunProperty.STATE_ID:
            case ImportExportTemplateRunProperty.STATE:
                displayValue = 'Translatable#Task State';
                break;
            case ImportExportTemplateRunProperty.START_TIME:
                displayValue = 'Translatable#Task Start Time';
                break;
            case ImportExportTemplateRunProperty.END_TIME:
                displayValue = 'Translatable#Task End Time';
                break;
            case ImportExportTemplateRunProperty.SUCCESS_COUNT:
                displayValue = 'Translatable#Successfully processed lines';
                break;
            case ImportExportTemplateRunProperty.FAIL_COUNT:
                displayValue = 'Translatable#Incorrectly processed lines';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        templateRun: ImportExportTemplateRun, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = templateRun[property];

        switch (property) {
            case ImportExportTemplateRunProperty.STATE_ID:
                displayValue = templateRun.State ? templateRun.State :
                    displayValue === 1 ? 'Translatable#running' : 'Translatable#finished';
                break;
            default:
                translatable = false;
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case ImportExportTemplateRunProperty.START_TIME:
            case ImportExportTemplateRunProperty.END_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case ImportExportTemplateRunProperty.LIST_NUMBER:
            case ImportExportTemplateRunProperty.SUCCESS_COUNT:
            case ImportExportTemplateRunProperty.FAIL_COUNT:
                translatable = false;
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue !== null && typeof displayValue !== 'undefined' ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: ImportExportTemplateRun, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: ImportExportTemplateRun): string[] {
        return [];
    }

    public getObjectAdditionalText(object: ImportExportTemplateRun, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: ImportExportTemplateRun): string | ObjectIcon {
        return new ObjectIcon(null, 'ImportExportTemplateRun', object.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Import/Export Template Runs' : 'Translatable#Import/Export Template Run'
            );
        }
        return plural ? 'Import/Export Template Runs' : 'Import/Export Template Run';
    }

}

