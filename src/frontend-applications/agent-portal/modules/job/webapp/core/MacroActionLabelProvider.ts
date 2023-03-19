/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { MacroAction } from '../../model/MacroAction';
import { MacroActionProperty } from '../../model/MacroActionProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { MacroActionType } from '../../model/MacroActionType';
import { Macro } from '../../model/Macro';
import { LabelValueGroup } from '../../../../model/LabelValueGroup';
import { LabelValueGroupValue } from '../../../../model/LabelValueGroupValue';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class MacroActionLabelProvider extends LabelProvider {

    public constructor() {
        super();
        this.kixObjectType = KIXObjectType.MACRO_ACTION;
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof MacroAction || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;
        switch (property) {
            case MacroActionProperty.NUMBER:
                displayValue = 'Translatable#Number';
                break;
            case MacroActionProperty.TYPE:
                displayValue = 'Translatable#Action';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Skip';
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
        macroAction: MacroAction, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue: string;
        switch (property) {
            case MacroActionProperty.TYPE:
                if (value && macroAction) {
                    const macros = await KIXObjectService.loadObjects<Macro>(
                        KIXObjectType.MACRO, [macroAction.MacroID]
                    );

                    if (macros && macros.length) {
                        const type = macros[0].Type;
                        const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                            KIXObjectType.MACRO_ACTION_TYPE, [value], null, { id: type }, true
                        ).catch((error): MacroActionType[] => []);
                        if (macroActionTypes && !!macroActionTypes.length) {
                            displayValue = await TranslationService.translate(macroActionTypes[0].DisplayName);
                        }
                    }
                }
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, macroAction[property], translatable);

        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                displayValue = value && value === 2
                    ? await TranslationService.translate('Translatable#Yes')
                    : await TranslationService.translate('Translatable#No');
                break;

            default:
                displayValue = value ? value.toString() : '';
        }

        return displayValue;
    }

    public async getIcons(
        action: MacroAction, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (action) {
            value = action[property];
        }
        const icons = [];

        switch (property) {
            case KIXObjectProperty.VALID_ID:
                if (value && value === 2) {
                    icons.push('kix-icon-check');
                }
                break;
            default:
        }

        return icons;
    }

    public async getLabelValueGroups(macroAction: MacroAction): Promise<LabelValueGroup[]> {
        let groups: LabelValueGroup[] = [];
        if (macroAction) {
            const resultGroup = this.createResultGroup(macroAction);
            const parameterGroup = this.createParameterGroup(macroAction);

            groups = [resultGroup, parameterGroup];
        }

        return groups;
    }

    private createResultGroup(macroAction: MacroAction): LabelValueGroup {
        const resultVariables: LabelValueGroup[] = [];
        if (resultVariables) {
            for (const result in macroAction.ResultVariables) {
                if (macroAction.ResultVariables[result]) {
                    const value = new LabelValueGroupValue(macroAction.ResultVariables[result]);
                    resultVariables.push(new LabelValueGroup(result, value));
                }
            }
        }

        return new LabelValueGroup('Translatable#Results', null, null, null, resultVariables);
    }

    private createParameterGroup(macroAction: MacroAction): LabelValueGroup {
        const parameterValues: LabelValueGroup[] = [];
        if (parameterValues) {
            for (const result in macroAction.Parameters) {
                if (macroAction.Parameters[result]) {
                    let value = new LabelValueGroupValue(macroAction.Parameters[result]);
                    if (typeof value.value === 'object') {
                        const stringValue = BrowserUtil.formatJSON(value.value);
                        value = new LabelValueGroupValue(stringValue, true);
                    }
                    parameterValues.push(new LabelValueGroup(result, value));
                }
            }
        }

        return new LabelValueGroup('Translatable#Parameters', null, null, null, parameterValues);
    }

}
