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
                    result = await this.getDFDisplayValue(dfValue, dfValueOptions);
                }
            }
        }
        return result;
    }


    private async getDFDisplayValue(dfValue: DynamicFieldValue, dfOptions: string = ''): Promise<string> {
        let result = '';
        if (dfOptions && dfOptions.match(/^Key$/i)) {
            result = await this.handleKey(dfValue);
        } else if (dfOptions && dfOptions.match(/^HTML$/i)) {
            result = dfValue.DisplayValueHTML;
        } else if (dfOptions && dfOptions.match(/^Short$/i)) {
            result = dfValue.DisplayValueShort;
        } else if (dfOptions === '' || dfOptions.match(/^Value$/i)) {
            result = dfValue.DisplayValue;
        }
        return result;
    }

    private async handleKey(dfValue: DynamicFieldValue): Promise<string> {
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
            result = dfValue.DisplayValue;
        }
        return result;
    }

}
