/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from "../../../../modules/base-components/webapp/core/LabelProvider";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TranslationService } from "../../../../modules/translation/webapp/core/TranslationService";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { DynamicField } from "../../model/DynamicField";
import { DynamicFieldProperty } from "../../model/DynamicFieldProperty";

export class DynamicFieldLabelProvider extends LabelProvider<DynamicField> {

    public kixObjectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD;

    public isLabelProviderFor(dynamicField: DynamicField): boolean {
        return dynamicField instanceof DynamicField;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;
        switch (property) {
            case DynamicFieldProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case DynamicFieldProperty.LABEL:
                displayValue = 'Translatable#Label';
                break;
            case DynamicFieldProperty.FIELD_TYPE:
                displayValue = 'Translatable#Field Type';
                break;
            case DynamicFieldProperty.OBJECT_TYPE:
                displayValue = 'Translatable#Object Type';
                break;
            case DynamicFieldProperty.INTERNAL_FIELD:
                displayValue = 'Translatable#Internal Field';
                break;
            case DynamicFieldProperty.CUSTOMER_VISIBLE:
                displayValue = 'Translatable#Show in Customer Portal';
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

    public async getDisplayText(
        dynamicField: DynamicField, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = dynamicField[property];

        switch (property) {
            case DynamicFieldProperty.INTERNAL_FIELD:
                displayValue = dynamicField.InternalField ? 'Translatable#yes' : 'Translatable#no';
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        dynamicField: DynamicField, id?: boolean, title?: boolean, translatable: boolean = true): Promise<string> {
        return translatable ? await TranslationService.translate(dynamicField.Name) : dynamicField.Name;
    }

    public getObjectIcon(dynamicField?: DynamicField): string | ObjectIcon {
        return new ObjectIcon('DynamicField', dynamicField.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Dynamic Fields' : 'Translatable#Dynamic Field'
            );
        }
        return plural ? 'Dynamic Fields' : 'Dynamic Field';
    }

    public async getObjectTooltip(dynamicField: DynamicField, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(dynamicField.Name);
        }
        return dynamicField.Name;
    }

    public async getIcons(dynamicField: DynamicField, property: string): Promise<Array<string | ObjectIcon>> {
        if (property === DynamicFieldProperty.ID || property === 'ICON') {
            return [new ObjectIcon('DynamicField', dynamicField.ID)];
        } else if (property === DynamicFieldProperty.INTERNAL_FIELD) {
            return dynamicField.InternalField === 1 ? ['kix-icon-check'] : [];
        } else if (property === DynamicFieldProperty.CUSTOMER_VISIBLE) {
            return dynamicField.CustomerVisible ? ['kix-icon-check'] : [];
        }
        return null;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        if (property === DynamicFieldProperty.CUSTOMER_VISIBLE) {
            return 'kix-icon-men';
        }
        return null;
    }

}
