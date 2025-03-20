/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { MacroProperty } from '../../model/MacroProperty';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class NewMacroDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-macro-dialog-context';

    public async initContext(): Promise<void> {
        const formId = this.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
        if (formId) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            if (formInstance) {
                let scope = this.getAdditionalInformation(MacroProperty.SCOPE);
                formInstance.provideFixedValue(MacroProperty.SCOPE, new FormFieldValue(scope));
            }
        }
    }

}
