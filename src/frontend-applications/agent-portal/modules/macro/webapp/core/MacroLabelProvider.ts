/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { Macro } from '../../model/Macro';
import { MacroProperty } from '../../model/MacroProperty';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class MacroLabelProvider extends LabelProvider<Macro> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.MACRO;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Macro || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case MacroProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case MacroProperty.TYPE:
                displayValue = 'Translatable#Type';
                break;
            case MacroProperty.SCOPE:
                displayValue = 'Translatable#Scope';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, false
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        macro: Macro, property: string, defaultValue?: string, translatable?: boolean, short?: boolean
    ): Promise<string> {
        let displayValue = macro[property];

        switch (property) {
            case MacroProperty.ID:
                displayValue = macro?.ID;
                break;
            case MacroProperty.NAME:
                displayValue = macro?.Name;
                break;
            case MacroProperty.TYPE:
                displayValue = macro?.Type || defaultValue;
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


    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue;
        switch (property) {
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

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        return plural ? 'Rule Set Macros' : 'Rule Set Macro';
    }

    public async getObjectText(macro: Macro, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return macro?.Name;
    }

    public async getObjectTooltip(macro: Macro, translatable: boolean = true): Promise<string> {
        return macro ? macro.Name : 'Rule Set Macro';
    }
}
