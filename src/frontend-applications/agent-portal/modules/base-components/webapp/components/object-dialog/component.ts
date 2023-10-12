/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ObjectDialogService } from '../../core/ObjectDialogService';
import { AdditionalContextInformation } from '../../core/AdditionalContextInformation';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Save'
        ]);

        this.state.submitButtonText = this.state.translations['Translatable#Save'];

        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            const submitButtonText = context.getAdditionalInformation(
                AdditionalContextInformation.DIALOG_SUBMIT_BUTTON_TEXT
            );
            if (submitButtonText) {
                this.state.submitButtonText = await TranslationService.translate(submitButtonText);
            }
            this.state.widgets = await context.getContent();
        }
    }

    public async submit(): Promise<void> {
        await ObjectDialogService.getInstance().submit();
    }

    public async cancel(): Promise<void> {
        await ContextService.getInstance().toggleActiveContext();
    }

}

module.exports = Component;
