/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler } from "../../../base-components/webapp/core/IPlaceholderHandler";
import { PlaceholderService } from "../../../base-components/webapp/core/PlaceholderService";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { DynamicFieldType } from "../../model/DynamicFieldType";
import { DynamicFieldValue } from "../../model/DynamicFieldValue";
import { CheckListItem } from "./CheckListItem";
import { LabelService } from "../../../base-components/webapp/core/LabelService";

export class DynamicFieldValuePlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'DynamicFieldValuePlaceholderHandler';
    private objectStrings = [];

    public isHandlerFor(objectString: string): boolean {
        return this.objectStrings.some((os) => os === objectString);
    }

    public async replace(placeholder: string, object?: KIXObject, language?: string): Promise<string> {
        let result = '';

        const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
        if (attribute && PlaceholderService.getInstance().isDynamicFieldAttribute(attribute)) {
            const dfOption = PlaceholderService.getInstance().getOptionsString(placeholder);
            result = await this.replaceDFValue(object, dfOption);
        }

        return result;
    }

    public async replaceDFValue(object: KIXObject, optionString: string): Promise<string> {
        let result = '';
        if (object && Array.isArray(object.DynamicFields)) {
            // TODO: currently not necessary/possible
            // if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
            //     language = 'en';
            // }

            if (optionString) {
                let dfName = optionString;
                let dfValueOptions = '';
                if (dfName.match(/.+_.+/)) {
                    dfValueOptions = dfName.replace(/.+?_(.+)/, '$1');
                    dfName = dfName.replace(/(.+?)_.+/, '$1');
                }

                const dfValue = dfName ? object.DynamicFields.find((dfv) => dfv.Name === dfName) : null;
                if (dfValue) {
                    result = await this.getDFDisplayValue(object, dfValue, dfValueOptions);
                }
            }
        }
        return result;
    }


    private async getDFDisplayValue(
        object: KIXObject, dfValue: DynamicFieldValue, dfOptions: string = ''
    ): Promise<string> {
        let result = '';
        if (!dfValue.Value) {
            dfValue.Value = [];
        } else if (!Array.isArray(dfValue.Value)) {
            dfValue.Value = [dfValue.Value];
        }
        if (dfOptions && dfOptions.match(/^Key$/i)) {
            result = await this.handleKey(object, dfValue);
        } else if (dfOptions && dfOptions.match(/^HTML$/i)) {
            result = await this.handleHTMLValue(object, dfValue);
        } else if (dfOptions && dfOptions.match(/^Short$/i)) {
            result = await this.handleShortValue(object, dfValue);
        } else if (dfOptions === '' || dfOptions.match(/^Value$/i)) {
            result = await this.handleValue(object, dfValue);
        }
        return result;
    }

    private async handleKey(object: KIXObject, dfValue: DynamicFieldValue): Promise<string> {
        const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
        let result: string = '';
        if (
            dynamicField &&
            (
                dynamicField.FieldType === DynamicFieldType.SELECTION ||
                dynamicField.FieldType === DynamicFieldType.CI_REFERENCE
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

    private async handleValue(object: KIXObject, dfValue: DynamicFieldValue): Promise<string> {
        let result: string = dfValue.DisplayValue ? dfValue.DisplayValue : '';
        if (!result) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
            if (dynamicField) {
                const separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                    dynamicField.Config.ItemSeparator : ', ';
                if (dynamicField.FieldType === DynamicFieldType.CHECK_LIST) {
                    result = this.getChecklistStringValue(dfValue);
                } else {
                    const labelProvider = LabelService.getInstance().getLabelProvider(object);
                    if (labelProvider) {
                        const values = await labelProvider.getDFDisplayValues(dfValue);
                        result = values ? values[1] : Array.isArray(dfValue.Value) ?
                            dfValue.Value.join(separator) : [dfValue.Value].join(separator);
                    }
                }
            }
        }
        return result;
    }

    private async handleShortValue(object: KIXObject, dfValue: DynamicFieldValue): Promise<string> {
        let result: string = dfValue.DisplayValueShort ? dfValue.DisplayValueShort : '';
        if (!result) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
            if (dynamicField) {
                const separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                    dynamicField.Config.ItemSeparator : ', ';
                const labelProvider = LabelService.getInstance().getLabelProvider(object);
                if (labelProvider) {
                    const values = await labelProvider.getDFDisplayValues(dfValue);
                    result = values ? values[1] : Array.isArray(dfValue.Value) ?
                        dfValue.Value.join(separator) : [dfValue.Value].join(separator);
                }
            }
        }
        return result;
    }

    private async handleHTMLValue(object: KIXObject, dfValue: DynamicFieldValue): Promise<string> {
        let result: string = dfValue.DisplayValueHTML ? dfValue.DisplayValueHTML : '';
        if (!result) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
            if (dynamicField && dynamicField.FieldType === DynamicFieldType.CHECK_LIST) {
                result = this.getChecklistHTMLValue(dfValue);
            } else {
                result = await this.handleValue(object, dfValue);
            }
        }
        return result;
    }

    private getChecklistStringValue(dfValue: DynamicFieldValue): string {
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
                    result += '<tr>'
                        + '<td style="padding:10px 15px;">' + cl[0] + '</td>'
                        + '<td style="padding:10px 15px;">' + cl[1] + '</td>'
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
