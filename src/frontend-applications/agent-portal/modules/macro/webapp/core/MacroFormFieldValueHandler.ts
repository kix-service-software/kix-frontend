/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormFieldValueHandler } from '../../../base-components/webapp/core/FormFieldValueHandler';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { MacroProperty } from '../../model/MacroProperty';
import { MacroFieldCreator } from './MacroFieldCreator';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { Macro } from '../../model/Macro';

export class MacroFormFieldValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.MACRO;

    public id: string = 'RuleSetMacroFormFieldValueHandler';

    private timeout;

    public constructor() {
        super();
    }

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(async () => {

            const macroTypeValue = changedFieldValues.find(
                (cv) => cv[0]?.property === MacroProperty.TYPE
            );

            if (macroTypeValue) {
                const macro = await ContextService.getInstance().getActiveContext().getObject();
                await MacroFieldCreator.createMacroPage(
                    formInstance, macro as Macro, 'Macros', macroTypeValue[1].value
                );
            }

            this.timeout = null;
        }, 100);
    }
}
