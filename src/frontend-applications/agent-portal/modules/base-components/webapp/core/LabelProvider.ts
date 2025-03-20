/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { SearchProperty } from '../../../search/model/SearchProperty';
import { ExtendedLabelProvider } from './ExtendedLabelProvider';
import { Label } from './Label';
import { OverlayIcon } from './OverlayIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

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

    public async getPropertyText(
        property: string, short?: boolean, translatable?: boolean, object?: KIXObject, objectIds?: string[] | number[]
    ): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case KIXObjectProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.VALID_ID:
            case 'Valid':
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
            case KIXObjectProperty.LINKS:
                displayValue = 'Translatable#Links';
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
                    const dfName = KIXObjectService.getDynamicFieldName(property);
                    if (dfName) {
                        if (property.match(/_key$/)) {
                            property = property.replace(/(.+)_key/, '$1');
                        } else {
                            property = dfName;
                        }
                    }
                    return property;
            }
        }
        return this.getPropertyText(property);
    }

    public async getExportPropertyValue(property: string, value: any, object?: any): Promise<any> {
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
                let dfName = KIXObjectService.getDynamicFieldName(property);
                if (dfName && object) {
                    let isKey = false;
                    if (property.match(/_key$/)) {
                        isKey = true;
                        dfName = dfName.replace(/(.+)_key/, '$1');
                    }
                    const fieldValue = object.DynamicFields?.find((dfv) => dfv.Name === dfName);
                    if (isKey && fieldValue?.Value) {
                        newValue = fieldValue.Value.join(':KEYSEPARATOR:');
                    } else if (fieldValue) {
                        // remove prepared value so code have to prepare it itself (CIRef)
                        fieldValue.PreparedValue = null;
                        newValue = await this.getDisplayText(object, property);
                    }
                }
        }
        return newValue;
    }

    public async getDisplayText(
        object: any, property: string, defaultValue?: string, translatable?: boolean, short?: boolean
    ): Promise<string> {
        let displayValue: string;

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const fieldValue = object.DynamicFields?.find((dfv) => dfv.Name === dfName);
            if (fieldValue) {
                const preparedValue = await this.getDFDisplayValues(fieldValue);
                if (preparedValue && preparedValue[1]) {
                    displayValue = preparedValue[1];
                } else if (fieldValue.DisplayValue) {
                    displayValue = fieldValue.DisplayValue.toString();
                } else {
                    // if no prepared value and also no DisplayValue given
                    // then "Value" should not be returned, too
                    // displayValue = fieldValue.Value.toString();
                    displayValue = '';
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
                    displayValue = await KIXObjectService.loadDisplayValue(KIXObjectType.USER, value);
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

    public async getDFDisplayValues(
        fieldValue: DynamicFieldValue, short?: boolean, language?: string
    ): Promise<[string[], string, string[]]> {
        // TODO: loop needed? => LabelService does it already
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
                        values = await LabelProvider.getDFDateDateTimeFieldValues(dynamicField, fieldValue, language);
                        break;
                    case DynamicFieldTypes.SELECTION:
                        values = await LabelProvider.getDFSelectionFieldValues(dynamicField, fieldValue, language);
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
        field: DynamicField, fieldValue: DynamicFieldValue, language?: string
    ): Promise<string[]> {
        let values;

        if (Array.isArray(fieldValue.Value)) {
            const valuesPromises = [];
            for (const v of fieldValue.Value) {
                if (field.FieldType === DynamicFieldTypes.DATE) {
                    valuesPromises.push(DateTimeUtil.getLocalDateString(v, language));
                } else {
                    valuesPromises.push(DateTimeUtil.getLocalDateTimeString(v, language));
                }
            }
            values = await Promise.all<string>(valuesPromises);
        } else {
            let v: string;
            if (field.FieldType === DynamicFieldTypes.DATE) {
                v = await DateTimeUtil.getLocalDateString(fieldValue.DisplayValue, language);
            } else {
                v = await DateTimeUtil.getLocalDateTimeString(fieldValue.DisplayValue, language);
            }
            values = [v];
        }

        return values;
    }

    public static async getDFSelectionFieldValues(
        field: DynamicField, fieldValue: DynamicFieldValue, language?: string
    ): Promise<string[]> {
        let values = fieldValue.PreparedValue;

        // backend prepared values are not translated
        const translate = Boolean(field.Config.TranslatableValues);
        if (translate || (!values && field.Config && field.Config.PossibleValues && Array.isArray(fieldValue.Value))) {
            const valuesPromises = [];
            for (const v of fieldValue.Value) {
                if (field.Config.PossibleValues[v]) {
                    if (translate) {
                        valuesPromises.push(
                            TranslationService.translate(field.Config.PossibleValues[v], undefined, language)
                        );
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

    public async createLabelsFromDFValue(fieldValue: DynamicFieldValue): Promise<Label[]> {
        return null;
    }

    public async getLabelByObject(object: KIXObject): Promise<Label> {
        return null;
    }

    public async getOverlayIcon(objectType: KIXObjectType | string, objectId: number | string): Promise<OverlayIcon> {
        return null;
    }
}
