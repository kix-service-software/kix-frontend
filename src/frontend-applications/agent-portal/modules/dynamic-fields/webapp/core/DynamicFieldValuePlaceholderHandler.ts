/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { DynamicFieldTypes } from '../../model/DynamicFieldTypes';
import { DynamicFieldValue } from '../../model/DynamicFieldValue';
import { CheckListItem } from '../../model/CheckListItem';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ExtendedDynamicFieldPlaceholderHandler } from './ExtendedDynamicFieldPlaceholderHandler';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class DynamicFieldValuePlaceholderHandler extends AbstractPlaceholderHandler {

    private static INSTANCE: DynamicFieldValuePlaceholderHandler;

    public static getInstance(): DynamicFieldValuePlaceholderHandler {
        if (!DynamicFieldValuePlaceholderHandler.INSTANCE) {
            DynamicFieldValuePlaceholderHandler.INSTANCE = new DynamicFieldValuePlaceholderHandler();
        }
        return DynamicFieldValuePlaceholderHandler.INSTANCE;
    }

    private extendedPlaceholderHandler: ExtendedDynamicFieldPlaceholderHandler[] = [];

    public handlerId: string = '150-DynamicFieldValuePlaceholderHandler';

    public addExtendedPlaceholderHandler(handler: ExtendedDynamicFieldPlaceholderHandler): void {
        this.extendedPlaceholderHandler.push(handler);
    }

    public isHandlerForObjectType(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.DYNAMIC_FIELD;
    }

    public async replace(
        placeholder: string, object?: KIXObject, language?: string, forRichtext?: boolean,
        translate: boolean = true
    ): Promise<string> {
        let result = '';

        const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
        if (attribute && PlaceholderService.getInstance().isDynamicFieldAttribute(attribute)) {
            const dfOption = PlaceholderService.getInstance().getOptionsString(placeholder);
            result = await this.replaceDFValue(object, dfOption, language, forRichtext, translate);
        }

        return result;
    }

    public async replaceDFValue(
        object: KIXObject, optionString: string,
        language?: string, forRichtext?: boolean, translate?: boolean,
        objectSpecificLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<string> {
        let objectWithDF = object;
        if (object && (!object.DynamicFields) || !object.DynamicFields.length) {
            const objects = await KIXObjectService.loadObjects(
                object.KIXObjectType, [object.ObjectId],
                new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS]),
                objectSpecificLoadingOptions
            );

            if (Array.isArray(objects) && objects.length) {
                objectWithDF = objects[0];
            }
        }

        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.replaceDFValue(
                objectWithDF, optionString, language, forRichtext, translate
            );
            if (value) {
                return value;
            }
        }

        let result = '';
        if (objectWithDF && Array.isArray(objectWithDF.DynamicFields)) {
            if (optionString) {
                let dfName = optionString;
                let dfValueOptions = '';
                if (dfName.match(/.+_.+/)) {
                    dfValueOptions = dfName.replace(/.+?_(.+)/, '$1');
                    dfName = dfName.replace(/(.+?)_.+/, '$1');
                }

                const dfValue = dfName ? objectWithDF.DynamicFields.find((dfv) => dfv.Name === dfName) : null;
                result = await this.getDFDisplayValue(
                    objectWithDF, dfValue, dfValueOptions, language, forRichtext, translate
                );
            }
        }
        return result;
    }

    private async getDFDisplayValue(
        object: KIXObject, dfValue: DynamicFieldValue, dfOptions: string = '',
        language?: string, forRichtext?: boolean, translate?: boolean
    ): Promise<string | any> {
        if (dfValue && (typeof dfValue.Value === 'undefined' || dfValue.Value === null)) {
            dfValue.Value = [];
        }

        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.getDFDisplayValue(
                object, dfValue, dfOptions, language, forRichtext, translate
            );
            if (value) {
                return value;
            }
        }

        let result: string | any = '';
        if (dfValue && !Array.isArray(dfValue.Value)) {
            dfValue.Value = [dfValue.Value];
        }
        if (dfValue && dfOptions && dfOptions.match(/^Key$/i)) {
            result = await this.handleKey(object, dfValue);
        } else if (dfValue && dfOptions && dfOptions.match(/^HTML$/i)) {
            result = await this.handleHTMLValue(object, dfValue, language);
        } else if (dfValue && dfOptions && dfOptions.match(/^Short$/i)) {
            result = await this.handleShortValue(object, dfValue, language);
        } else if (dfOptions && dfOptions.match(/^ObjectValue.*$/i)) {
            result = await this.handleObjectValue(object, dfOptions, dfValue);
        } else if (dfOptions && dfOptions.match(/^Object_\d+_.+$/i) && dfValue?.Value?.length) {
            result = await this.handleObject(object, dfOptions, dfValue, language, forRichtext, translate);
        } else if (dfValue && (dfOptions === '' || dfOptions.match(/^Value$/i))) {
            result = await this.handleValue(object, dfValue, language);
        }
        return result;
    }

    private async handleKey(object: KIXObject, dfValue: DynamicFieldValue): Promise<string> {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.handleKey(object, dfValue);
            if (value) {
                return value;
            }
        }

        const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name, dfValue.ID);
        let result: string = '';
        if (
            dynamicField &&
            (
                dynamicField.FieldType === DynamicFieldTypes.SELECTION ||
                dynamicField.FieldType === DynamicFieldTypes.CI_REFERENCE
            )
        ) {
            const separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                dynamicField.Config.ItemSeparator : ', ';
            result = Array.isArray(dfValue.Value) ? dfValue.Value.join(separator) : [dfValue.Value].join(separator);
        } else {
            result = await this.handleValue(object, dfValue);
        }
        return result;
    }

    private async handleValue(object: KIXObject, dfValue: DynamicFieldValue, language?: string): Promise<string> {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.handleValue(object, dfValue, language);
            if (value) {
                return value;
            }
        }

        // check if displayValue has needed translation
        let useDisplayValue: boolean = true;
        if (language) {
            const userLanguage = await TranslationService.getUserLanguage();
            useDisplayValue = language === userLanguage;
        }
        let result: string = useDisplayValue && dfValue.DisplayValue ? dfValue.DisplayValue : '';
        if (!result) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
            if (dynamicField) {
                if (dynamicField.FieldType === DynamicFieldTypes.CHECK_LIST) {
                    result = this.getChecklistStringValue(dfValue);
                } else {
                    const values = await LabelService.getInstance().getDFDisplayValues(
                        object.KIXObjectType, dfValue, false, language
                    );
                    const separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                        dynamicField.Config.ItemSeparator : ', ';

                    const fallbackValue = Array.isArray(dfValue.Value)
                        ? dfValue.Value.join(separator)
                        : [dfValue.Value].join(separator);

                    result = values && values[1]
                        ? values[1]
                        : fallbackValue;
                }
            }
        }
        return result;
    }

    private async handleShortValue(object: KIXObject, dfValue: DynamicFieldValue, language?: string): Promise<string> {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.handleShortValue(object, dfValue, language);
            if (value) {
                return value;
            }
        }

        // check if displayValue has needed translation
        let useDisplayValue: boolean = true;
        if (language) {
            const userLanguage = await TranslationService.getUserLanguage();
            useDisplayValue = language === userLanguage;
        }
        let result: string = useDisplayValue && dfValue.DisplayValueShort ? dfValue.DisplayValueShort : '';
        if (!result) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
            if (dynamicField) {
                const separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                    dynamicField.Config.ItemSeparator : ', ';
                const values = await LabelService.getInstance().getDFDisplayValues(
                    object.KIXObjectType, dfValue, true, language

                );
                result = values ? values[1] : Array.isArray(dfValue.Value) ?
                    dfValue.Value.join(separator) : [dfValue.Value].join(separator);
            }
        }
        return result;
    }

    private async handleHTMLValue(object: KIXObject, dfValue: DynamicFieldValue, language?: string): Promise<string> {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.handleHTMLValue(object, dfValue, language);
            if (value) {
                return value;
            }
        }

        // check if displayValue has needed translation
        let useDisplayValue: boolean = true;
        if (language) {
            const userLanguage = await TranslationService.getUserLanguage();
            useDisplayValue = language === userLanguage;
        }
        let result: string = useDisplayValue && dfValue.DisplayValueHTML ? dfValue.DisplayValueHTML : '';
        if (!result) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
            if (dynamicField && dynamicField.FieldType === DynamicFieldTypes.CHECK_LIST) {
                result = this.getChecklistHTMLValue(dfValue);
            } else {
                result = await this.handleValue(object, dfValue, language);
            }
        }
        return result;
    }

    private async handleObjectValue(object: KIXObject, dfOptions: string = '', dfValue: DynamicFieldValue): Promise<string | any> {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.handleObjectValue(object, dfOptions, dfValue);
            if (value) {
                return value;
            }
        }

        let result;
        const valueIndex = dfOptions.replace(/^ObjectValue_(\d+?)$/, '$1');
        if (valueIndex === 'ObjectValue') {
            result = dfValue ? dfValue.Value : [];
        } else if (!isNaN(Number(valueIndex))) {
            result = dfValue &&
                typeof dfValue.Value[valueIndex] !== 'undefined' &&
                dfValue.Value[valueIndex] !== null ?
                dfValue.Value[valueIndex] : '';
        }
        return result;
    }

    private async handleObject(
        object: KIXObject, dfOptions: string = '', dfValue: DynamicFieldValue,
        language?: string, forRichtext?: boolean, translate?: boolean
    ): Promise<string> {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = await extendedHandler.handleObject(object, dfOptions, dfValue);
            if (value) {
                return value;
            }
        }

        let result: string = '';
        const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name, dfValue.ID);
        if (dynamicField) {
            const attributePath = dfOptions.replace(/^Object_(\d+_.+)/, '$1');
            result = await PlaceholderService.getInstance().replaceDFObjectPlaceholder(
                attributePath,
                dynamicField.FieldType,
                dfValue.Value,
                language, forRichtext, translate
            );
        }
        return result;
    }

    private getChecklistStringValue(dfValue: DynamicFieldValue): string {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = extendedHandler.getChecklistStringValue(dfValue);
            if (value) {
                return value;
            }
        }

        let result = `${dfValue.Name}</br >`;
        for (const v of dfValue.Value) {
            const checklist: CheckListItem[] = JSON.parse(v);
            const checkListItems = this.getChecklistItems(checklist);
            if (checkListItems.length) {
                checkListItems.forEach((cl) => {
                    result += `- ${cl[0]}: ${cl[1]}<br />`;
                });

                result += '<br />';
            }
        }
        return result;
    }

    private getChecklistHTMLValue(dfValue: DynamicFieldValue): string {
        for (const extendedHandler of this.extendedPlaceholderHandler) {
            const value = extendedHandler.getChecklistHTMLValue(dfValue);
            if (value) {
                return value;
            }
        }

        let result = `<h3>${dfValue.Name}</h3>`;
        for (const v of dfValue.Value) {
            const checklist: CheckListItem[] = JSON.parse(v);
            const checkListItems = this.getChecklistItems(checklist);
            if (checkListItems.length) {
                result += '<table style="border:none; width:90%">'
                    + '<thead><tr>'
                    + '<th style="padding:10px 15px;">Action</th>'
                    + '<th style="padding:10px 15px;">State</th>'
                    + '<tr></thead>'
                    + '<tbody>';

                checkListItems.forEach((cl) => {
                    const value = cl[1].replace(/\n/g, '<br/>');
                    result += '<tr>'
                        + '<td style="padding:10px 15px;">' + cl[0] + '</td>'
                        + '<td style="padding:10px 15px;">' + value + '</td>'
                        + '</tr>';
                });

                result += '</tbody></table>';
            }
        }
        return result;
    }

    private getChecklistItems(checklist: CheckListItem[]): Array<[string, string]> {
        const list = [];
        checklist.forEach((cl) => {
            list.push([cl.title, cl.value]);
            if (Array.isArray(cl.sub)) {
                const subList = this.getChecklistItems(cl.sub);
                if (subList.length) {
                    list.push(...subList);
                }
            }
        });
        return list;
    }

}
