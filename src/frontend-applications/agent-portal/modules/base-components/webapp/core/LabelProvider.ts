/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ILabelProvider } from './ILabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { KIXObjectService } from './KIXObjectService';
import { ValidObject } from '../../../valid/model/ValidObject';
import { User } from '../../../user/model/User';
import { DateTimeUtil } from './DateTimeUtil';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { UserProperty } from '../../../user/model/UserProperty';
import { DynamicFieldFormUtil } from './DynamicFieldFormUtil';
import { ConfigItemProperty } from '../../../cmdb/model/ConfigItemProperty';
import { ConfigItem } from '../../../cmdb/model/ConfigItem';
import { LabelService } from './LabelService';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { ExtendedLabelProvider } from './ExtendedLabelProvider';
import { Label } from './Label';

export class LabelProvider<T = any> implements ILabelProvider<T> {

    public kixObjectType: KIXObjectType | string;
    protected dFRegEx = new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`);

    private extendedLabelProvider: ExtendedLabelProvider[] = [];

    public addExtendedLabelProvider(labelProvider: ExtendedLabelProvider): void {
        this.extendedLabelProvider.push(labelProvider);
    }

    public getExtendedLabelProvider(): ExtendedLabelProvider[] {
        return this.extendedLabelProvider;
    }

    public isLabelProviderFor(object: T): boolean {
        throw new Error('Method not implemented.');
    }

    public isLabelProviderForType(objectType: KIXObjectType | string): boolean {
        return objectType === this.kixObjectType;
    }

    public getSupportedProperties(): string[] {
        return [];
    }

    public isLabelProviderForDFType(dfFieldType: string): boolean {
        for (const extendedLabelProvider of this.getExtendedLabelProvider()) {
            if (extendedLabelProvider.isLabelProviderForDFType(dfFieldType)) {
                return true;
            }
        }
        return false;
    }

    public async getObjectText(object: T, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return object.toString();
    }

    public async getObjectName(plural?: boolean, translatable?: boolean): Promise<string> {
        return '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case KIXObjectProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case KIXObjectProperty.CREATE_BY:
            case 'CreatedBy':
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
            case 'Created':
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
            case 'ChangedBy':
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
            case 'Changed':
                displayValue = 'Translatable#Changed at';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            case 'LinkedAs':
                displayValue = 'Translatable#Linked as';
                break;
            default:
                const dfName = KIXObjectService.getDynamicFieldName(property);
                if (dfName) {
                    const dynamicField = await KIXObjectService.loadDynamicField(dfName);
                    if (dynamicField) {
                        displayValue = dynamicField.Label;
                    }
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getExportPropertyText(property: string, useDisplayText?: boolean): Promise<string> {
        if (!useDisplayText) {
            switch (property) {
                case KIXObjectProperty.VALID_ID:
                    return 'Validity';
                default:
                    return property;
            }
        }
        return this.getPropertyText(property);
    }

    public async getExportPropertyValue(property: string, value: any): Promise<any> {
        let newValue = value;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                if (value) {
                    const validObjects = await KIXObjectService.loadObjects<ValidObject>(
                        KIXObjectType.VALID_OBJECT, [value], null, null, true
                    ).catch((error) => [] as ValidObject[]);
                    newValue = validObjects && !!validObjects.length ? validObjects[0].Name : value;
                }
                break;
            default:
        }
        return newValue;
    }

    public async getDisplayText(
        object: any, property: string, defaultValue?: string, translatable?: boolean, short?: boolean
    ): Promise<string> {
        let displayValue: string;

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName && object.KIXObjectType && object.ObjectId) {
            const objects = await KIXObjectService.loadObjects(
                object.KIXObjectType, [object.ObjectId],
                new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
            );

            if (objects && objects.length) {
                const kixObject = objects[0];
                let fieldValue: DynamicFieldValue;
                if (Array.isArray(kixObject.DynamicFields) && kixObject.DynamicFields.length) {
                    fieldValue = kixObject.DynamicFields.find((dfv) => dfv.Name === dfName);
                    if (fieldValue) {
                        const preparedValue = await this.getDFDisplayValues(fieldValue);
                        if (preparedValue && preparedValue[1]) {
                            displayValue = preparedValue[1];
                        } else {
                            displayValue = fieldValue.DisplayValue.toString();
                        }
                    }
                }
            }
        } else {
            return this.getPropertyValueDisplayText(property, object[property], translatable);
        }

        return displayValue;
    }

    public getObjectAdditionalText(object: T, translatable?: boolean): string {
        return '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number | any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                if (value) {
                    const validObjects = await KIXObjectService.loadObjects<ValidObject>(
                        KIXObjectType.VALID_OBJECT, [value], null, null, true
                    ).catch((error) => [] as ValidObject[]);
                    displayValue = validObjects && !!validObjects.length ? validObjects[0].Name : value;
                }
                break;
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
            case 'CreatedBy':
            case 'ChangedBy':
                if (value) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value],
                        new KIXObjectLoadingOptions(
                            null, null, null, [UserProperty.CONTACT]
                        ), null, true, true, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && users.length ?
                        users[0].Contact ? users[0].Contact.Fullname : users[0].UserLogin : value;
                }
                break;
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = translatable ?
                    await DateTimeUtil.getLocalDateTimeString(displayValue) : displayValue;
                break;
            default:
                const dfName = KIXObjectService.getDynamicFieldName(property);
                if (dfName) {
                    const preparedValue = await this.getDFDisplayValues(
                        new DynamicFieldValue({
                            Name: dfName,
                            Value: value
                        } as DynamicFieldValue)
                    );
                    if (preparedValue && preparedValue[1]) {
                        displayValue = preparedValue[1];
                    } else {
                        displayValue = value ? value.toString() : '';
                    }
                }
                translatable = false;
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectTooltip(object: T, translatable?: boolean): Promise<string> {
        return '';
    }

    public getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return null;
    }

    public getDisplayTextClasses(object: T, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: T): string[] {
        return [];
    }

    public getObjectIcon(object?: T): string | ObjectIcon {
        return this.getObjectTypeIcon();
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return null;
    }

    public async getIcons(
        object: T, property: string, value?: string | number, forTable?: boolean
    ): Promise<Array<(string | ObjectIcon)>> {
        return [];
    }

    public canShow(property: string, object: T): boolean {
        return true;
    }

    public async getDFDisplayValues(fieldValue: DynamicFieldValue): Promise<[string[], string, string[]]> {
        for (const elp of this.extendedLabelProvider) {
            const result = await elp.getDFDisplayValues(fieldValue);
            if (result) {
                return result;
            }
        }

        let values = [];
        let separator = '';

        if (fieldValue) {
            const dynamicField = await KIXObjectService.loadDynamicField(
                fieldValue.Name ? fieldValue.Name : null,
                fieldValue.ID ? Number(fieldValue.ID) : null
            );

            if (dynamicField) {
                separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                    dynamicField.Config.ItemSeparator : ', ';
                switch (dynamicField.FieldType) {
                    case DynamicFieldTypes.DATE:
                    case DynamicFieldTypes.DATE_TIME:
                        values = await LabelProvider.getDFDateDateTimeFieldValues(dynamicField, fieldValue);
                        break;
                    case DynamicFieldTypes.SELECTION:
                        values = await LabelProvider.getDFSelectionFieldValues(dynamicField, fieldValue);
                        break;
                    case DynamicFieldTypes.CI_REFERENCE:
                        values = await LabelProvider.getDFCIReferenceFieldValues(dynamicField, fieldValue);
                        break;
                    case DynamicFieldTypes.CHECK_LIST:
                        values = LabelProvider.getDFChecklistFieldShortValues(dynamicField, fieldValue);
                        break;
                    default:
                        values = Array.isArray(fieldValue.PreparedValue)
                            ? fieldValue.PreparedValue
                            : [fieldValue.PreparedValue];
                }
            }
        }

        return [values, values.join(separator), fieldValue.Value];
    }
    public static async getDFDateDateTimeFieldValues(
        field: DynamicField, fieldValue: DynamicFieldValue
    ): Promise<string[]> {
        let values;

        if (Array.isArray(fieldValue.Value)) {
            const valuesPromises = [];
            for (const v of fieldValue.Value) {
                if (field.FieldType === DynamicFieldTypes.DATE) {
                    valuesPromises.push(DateTimeUtil.getLocalDateString(v));
                } else {
                    valuesPromises.push(DateTimeUtil.getLocalDateTimeString(v));
                }
            }
            values = await Promise.all<string>(valuesPromises);
        } else {
            let v: string;
            if (field.FieldType === DynamicFieldTypes.DATE) {
                v = await DateTimeUtil.getLocalDateString(fieldValue.DisplayValue);
            } else {
                v = await DateTimeUtil.getLocalDateTimeString(fieldValue.DisplayValue);
            }
            values = [v];
        }

        return values;
    }

    public static async getDFSelectionFieldValues(
        field: DynamicField, fieldValue: DynamicFieldValue
    ): Promise<string[]> {
        let values = fieldValue.PreparedValue;

        if (!values && field.Config && field.Config.PossibleValues && Array.isArray(fieldValue.Value)) {
            const valuesPromises = [];
            const translate = Boolean(field.Config.TranslatableValues);
            for (const v of fieldValue.Value) {
                if (field.Config.PossibleValues[v]) {
                    if (translate) {
                        valuesPromises.push(TranslationService.translate(field.Config.PossibleValues[v]));
                    } else {
                        valuesPromises.push(field.Config.PossibleValues[v]);
                    }
                }
            }
            values = await Promise.all<string>(valuesPromises);
        }

        return values;
    }

    public static getDFChecklistFieldShortValues(field: DynamicField, fieldValue: DynamicFieldValue): string[] {
        const values = fieldValue.DisplayValueShort ? fieldValue.DisplayValueShort.split(', ') : [];
        if (
            (!values || !values.length) &&
            Array.isArray(fieldValue.Value)
        ) {
            for (const v of fieldValue.Value) {
                try {
                    const checklist = JSON.parse(v);
                    const counts = DynamicFieldFormUtil.getInstance().countValues(checklist);
                    values.push(`${counts[0]}/${counts[1]}`);
                } catch (error) {
                    console.error('Could not parse checklist value from dynamic field');
                    console.error(field);
                    console.error(fieldValue);
                    console.error(error);
                }
            }
        }
        return values;
    }

    public static async getDFCIReferenceFieldValues(
        field: DynamicField, fieldValue: DynamicFieldValue
    ): Promise<string[]> {
        let values = fieldValue.PreparedValue;

        if (!values && fieldValue.Value) {
            if (!Array.isArray(fieldValue.Value)) {
                values = [fieldValue.Value];
            } else {
                values = fieldValue.Value;
            }
            const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                KIXObjectType.CONFIG_ITEM, values,
                new KIXObjectLoadingOptions(
                    null, null, null, [ConfigItemProperty.CURRENT_VERSION]
                ), null, true
            ).catch(() => [] as ConfigItem[]);

            const valuePromises = [];
            configItems.forEach((ci) => valuePromises.push(LabelService.getInstance().getObjectText(ci)));
            values = await Promise.all<string>(valuePromises);
        }
        return values || [];
    }

    public async createLabelsFromDFValue(fieldValue: DynamicFieldValue): Promise<Label[]> {
        return null;
    }

}
