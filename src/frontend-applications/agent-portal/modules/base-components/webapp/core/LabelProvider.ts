/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ILabelProvider } from "./ILabelProvider";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";
import { KIXObjectService } from "./KIXObjectService";
import { ValidObject } from "../../../valid/model/ValidObject";
import { User } from "../../../user/model/User";
import { DateTimeUtil } from "./DateTimeUtil";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../../dynamic-fields/model/DynamicFieldProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { DynamicField } from "../../../dynamic-fields/model/DynamicField";
import { DynamicFieldValue } from "../../../dynamic-fields/model/DynamicFieldValue";
import { DynamicFieldType } from "../../../dynamic-fields/model/DynamicFieldType";
import { DynamicFieldFormUtil } from "./DynamicFieldFormUtil";
import { ConfigItem } from "../../../cmdb/model/ConfigItem";
import { LabelService } from "./LabelService";
import { ConfigItemProperty } from "../../../cmdb/model/ConfigItemProperty";

export class LabelProvider<T = any> implements ILabelProvider<T> {

    public kixObjectType: KIXObjectType | string;
    protected dFRegEx = new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`);

    public isLabelProviderFor(object: T): boolean {
        throw new Error("Method not implemented.");
    }

    public isLabelProviderForType(objectType: KIXObjectType | string): boolean {
        return objectType === this.kixObjectType;
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
            case KIXObjectProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            case 'LinkedAs':
                displayValue = 'Translatable#Linked as';
                break;
            default:
                if (property.match(this.dFRegEx)) {
                    const dfName = property.replace(this.dFRegEx, '$1');
                    const dynamicFields = dfName ? await KIXObjectService.loadObjects<DynamicField>(
                        KIXObjectType.DYNAMIC_FIELD, null,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                                    FilterType.AND, dfName
                                )
                            ]
                        ), null, true
                    ).catch(() => [] as DynamicField[]) : [];
                    if (dynamicFields.length) {
                        displayValue = dynamicFields[0].Label;
                    } else {
                        displayValue = property;
                    }
                } else {
                    displayValue = property;
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
            default:
        }
        return newValue;
    }

    public async getDisplayText(
        object: T, property: string, defaultValue?: string, translatable?: boolean
    ): Promise<string> {
        let displayValue;

        if (property.match(this.dFRegEx)) {
            const dfName = property.replace(this.dFRegEx, '$1');
            let fieldValue: DynamicFieldValue;
            if (object[KIXObjectProperty.DYNAMIC_FIELDS]) {
                fieldValue = object[KIXObjectProperty.DYNAMIC_FIELDS].find((dfv) => dfv.Name === dfName);
                if (fieldValue) {
                    const preparedValue = await this.getDFDisplayValues(fieldValue);
                    if (preparedValue && preparedValue[1]) {
                        displayValue = preparedValue[1];
                    } else {
                        displayValue = fieldValue.DisplayValue.toString();
                    }
                }
            }
        } else {
            displayValue = await this.getPropertyValueDisplayText(property, object[property], translatable);
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
                if (value) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                }
                break;
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
                if (property.match(this.dFRegEx) && value) {
                    const dfName = property.replace(this.dFRegEx, '$1');
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
                            displayValue = value.toString();
                        }
                    }
                    translatable = false;
                }
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

    public async getIcons(object: T, property: string, value?: string | number): Promise<Array<(string | ObjectIcon)>> {
        return [];
    }

    public canShow(property: string, object: T): boolean {
        return true;
    }

    public async getDFDisplayValues(fieldValue: DynamicFieldValue): Promise<[string[], string, string[]]> {
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
                    case DynamicFieldType.DATE:
                    case DynamicFieldType.DATE_TIME:
                        values = await this.getDFDateDateTimeFieldValues(dynamicField, fieldValue);
                        break;
                    case DynamicFieldType.SELECTION:
                        values = await this.getDFSelectionFieldValues(dynamicField, fieldValue);
                        break;
                    case DynamicFieldType.CI_REFERENCE:
                        values = await this.getCIReferenceFieldValues(dynamicField, fieldValue);
                        break;
                    case DynamicFieldType.CHECK_LIST:
                        values = this.getDFChecklistFieldValues(dynamicField, fieldValue);
                        break;
                    default:
                        values = Array.isArray(fieldValue.Value) ? fieldValue.Value : [fieldValue.Value];
                }
            }
        }
        return [values, values.join(separator), fieldValue.Value];
    }

    private async getDFDateDateTimeFieldValues(field: DynamicField, fieldValue: DynamicFieldValue): Promise<string[]> {
        let values;

        if (Array.isArray(fieldValue.Value)) {
            const valuesPromises = [];
            for (const v of fieldValue.Value) {
                if (field.FieldType === DynamicFieldType.DATE) {
                    valuesPromises.push(DateTimeUtil.getLocalDateString(v));
                } else {
                    valuesPromises.push(DateTimeUtil.getLocalDateTimeString(v));
                }
            }
            values = await Promise.all<string>(valuesPromises);
        } else {
            let v: string;
            if (field.FieldType === DynamicFieldType.DATE) {
                v = await DateTimeUtil.getLocalDateString(fieldValue.DisplayValue);
            } else {
                v = await DateTimeUtil.getLocalDateTimeString(fieldValue.DisplayValue);
            }
            values = [v];
        }

        return values;
    }

    private async getDFSelectionFieldValues(field: DynamicField, fieldValue: DynamicFieldValue): Promise<string[]> {
        let values;
        if (field.Config && field.Config.PossibleValues) {
            const valuesPromises = [];
            for (const v of fieldValue.Value) {
                if (field.FieldType === DynamicFieldType.DATE) {
                    valuesPromises.push(DateTimeUtil.getLocalDateString(v));
                } else {
                    valuesPromises.push(DateTimeUtil.getLocalDateTimeString(v));
                }
            }
            values = await Promise.all<string>(valuesPromises);
        } else {
            let v: string;
            if (field.FieldType === DynamicFieldType.DATE) {
                v = await DateTimeUtil.getLocalDateString(fieldValue.DisplayValue);
            } else {
                v = await DateTimeUtil.getLocalDateTimeString(fieldValue.DisplayValue);
            }
            values = [v];
        }

        return values || [];
    }

    private async getCIReferenceFieldValues(field: DynamicField, fieldValue: DynamicFieldValue): Promise<string[]> {
        let values = fieldValue.PreparedValue;

        if (!values && Array.isArray(fieldValue.Value)) {
            const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                KIXObjectType.CONFIG_ITEM, fieldValue.Value,
                new KIXObjectLoadingOptions(
                    null, null, null, [ConfigItemProperty.CURRENT_VERSION]
                ), null, true
            ).catch(() => [] as ConfigItem[]);

            const valuePromises = [];
            configItems.forEach((ci) => valuePromises.push(LabelService.getInstance().getText(ci)));
            values = await Promise.all<string>(valuePromises);
        }
        return values || [];
    }

    private getDFChecklistFieldValues(field: DynamicField, fieldValue: DynamicFieldValue): string[] {
        const values = fieldValue.DisplayValueShort ? fieldValue.DisplayValueShort.split(', ') : null;
        if (!values || !!values.length) {
            for (const v of fieldValue.Value) {
                const checklist = JSON.parse(v);
                const counts = DynamicFieldFormUtil.countValues(checklist);
                values.push(`${counts[0]}/${counts[1]}`);
            }
        }
        return values;
    }

}
