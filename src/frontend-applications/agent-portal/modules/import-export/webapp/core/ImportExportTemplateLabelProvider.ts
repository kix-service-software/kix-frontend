/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { ImportExportTemplate } from '../../model/ImportExportTemplate';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ImportExportTemplateProperty } from '../../model/ImportExportTemplateProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ImportExportTemplateRunTypes } from '../../model/ImportExportTemplateRunTypes';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ImportExportTemplateLabelProvider extends LabelProvider<ImportExportTemplate> {

    public kixObjectType: KIXObjectType = KIXObjectType.IMPORT_EXPORT_TEMPLATE;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(object: ImportExportTemplate | KIXObject): boolean {
        return object instanceof ImportExportTemplate || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ImportExportTemplateProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case ImportExportTemplateProperty.FORMAT:
                displayValue = 'Translatable#Format';
                break;
            case ImportExportTemplateProperty.OBJECT:
                displayValue = 'Translatable#Object';
                break;
            case ImportExportTemplateProperty.NUMBER:
                displayValue = 'Translatable#Number';
                break;
            case ImportExportTemplateProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            case ImportExportTemplateProperty.IMPORT_STATE:
                displayValue = 'Translatable#Importstate';
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
        template: ImportExportTemplate, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = template[property];

        switch (property) {
            case ImportExportTemplateProperty.ID:
                displayValue = template.Name;
                break;
            case ImportExportTemplateProperty.IMPORT_STATE:
                displayValue = '';
                if (template.Runs && !!template.Runs.length) {
                    displayValue = template.Runs.some(
                        (r) => r.StateID === 1 && r.Type === ImportExportTemplateRunTypes.IMPORT
                    ) ? 'Translatable#running' : '';
                }
                break;
            default:
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
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: ImportExportTemplate, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: ImportExportTemplate): string[] {
        return [];
    }

    public async getObjectText(
        object: ImportExportTemplate, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${object.Name}`;
    }

    public getObjectAdditionalText(object: ImportExportTemplate, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: ImportExportTemplate): string | ObjectIcon {
        return new ObjectIcon(null, 'ImportExportTemplate', object.ID);
    }

    public async getObjectTooltip(object: ImportExportTemplate, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(object.Name);
        }
        return object.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Import/Export Templates' : 'Translatable#Import/Export Template'
            );
        }
        return plural ? 'Import/Export Templates' : 'Import/Export Template';
    }

}

