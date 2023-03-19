/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { ConfigItemHistory } from '../../model/ConfigItemHistory';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ConfigItemHistoryProperty } from '../../model/ConfigItemHistoryProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';



import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';



export class ConfigItemHistoryLabelProvider extends LabelProvider<ConfigItemHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_HISTORY;

    public isLabelProviderFor(object: ConfigItemHistory | KIXObject): boolean {
        return object instanceof ConfigItemHistory || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemHistoryProperty.HISTORY_TYPE:
                displayValue = 'Translatable#Action';
                break;
            case ConfigItemHistoryProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case ConfigItemHistoryProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case ConfigItemHistoryProperty.VERSION_ID:
                displayValue = 'Translatable#to version';
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
        historyEntry: ConfigItemHistory, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = historyEntry[property];

        switch (property) {
            case ConfigItemHistoryProperty.VERSION_ID:
                displayValue = historyEntry.VersionID
                    ? await TranslationService.translate('Translatable#to Version')
                    : '';
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

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Translatable#Config Item History' : 'Translatable#Config Item History';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue, []);
        }
        return displayValue;
    }

    public async getIcons(object: ConfigItemHistory, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === ConfigItemHistoryProperty.VERSION_ID && object.VersionID) {
            icons.push('kix-icon-open-right');
        }
        return icons;
    }
}
