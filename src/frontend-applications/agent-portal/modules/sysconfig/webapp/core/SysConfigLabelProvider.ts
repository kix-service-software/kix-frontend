/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { SysConfigOptionDefinition } from '../../model/SysConfigOptionDefinition';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SysConfigOptionDefinitionProperty } from '../../model/SysConfigOptionDefinitionProperty';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { SysConfigOptionProperty } from '../../model/SysConfigOptionProperty';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class SysConfigLabelProvider extends LabelProvider<SysConfigOptionDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue: string;
        switch (property) {
            case SysConfigOptionDefinitionProperty.IS_MODIFIED:
                displayValue = value === 1 ? 'Translatable#Modified' : '';
                break;
            case SysConfigOptionProperty.READONLY:
                displayValue = value === 1 ? 'Translatable#yes' : 'no';
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = JSON.stringify(value);
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof SysConfigOptionDefinition || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;
        switch (property) {
            case SysConfigOptionDefinitionProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = 'Translatable#Value';
                break;
            case SysConfigOptionDefinitionProperty.IS_MODIFIED:
                displayValue = 'Translatable#Modified';
                break;
            case SysConfigOptionProperty.READONLY:
                displayValue = 'Translatable#Readonly';
                break;
            case SysConfigOptionDefinitionProperty.CONTEXT:
                displayValue = 'Translatable#Context';
                break;
            case SysConfigOptionDefinitionProperty.CONTEXT_METADATA:
                displayValue = 'Translatable#Metadata';
                break;
            case SysConfigOptionDefinitionProperty.ACCESS_LEVEL:
                displayValue = 'Translatable#Access Level';
                break;

            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        sysConfig: SysConfigOptionDefinition, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = sysConfig[property];
        switch (property) {
            case SysConfigOptionDefinitionProperty.NAME:
                displayValue = sysConfig.Name;
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = sysConfig.IsModified === 1
                    ? sysConfig.Value : sysConfig.Default;
                displayValue = sysConfig.Type === 'Hash'
                    ? JSON.stringify(displayValue) : displayValue;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: SysConfigOptionDefinition, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: SysConfigOptionDefinition): string[] {
        return [];
    }

    public async getObjectText(
        sysConfig: SysConfigOptionDefinition, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${sysConfig.Name}`;
    }

    public getObjectAdditionalText(object: SysConfigOptionDefinition, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: SysConfigOptionDefinition): string | ObjectIcon {
        return new ObjectIcon(null, 'SysConfig', object.Name);
    }

    public async getObjectTooltip(object: SysConfigOptionDefinition): Promise<string> {
        return '';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate('Translatable#SysConfig');
        }
        return 'SysConfig';
    }

    public async getIcons(object: SysConfigOptionDefinition, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === SysConfigOptionDefinitionProperty.IS_MODIFIED && object && object.IsModified) {
            icons.push('kix-icon-check');
        }
        return icons;
    }

}

