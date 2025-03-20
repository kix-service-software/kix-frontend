/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { EventService } from '../../core/EventService';
import { FormEvent } from '../../core/FormEvent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

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

            const canSubmit = context.getAdditionalInformation(AdditionalContextInformation.DIALOG_SUBMIT_ENABLED);
            if (typeof canSubmit === 'boolean') {
                this.state.canSubmit = canSubmit;
            }
        }

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === FormEvent.BLOCK) {
                    this.state.processing = data;
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.BLOCK, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.BLOCK, this.subscriber);
    }

    public async submit(): Promise<void> {
        await ObjectDialogService.getInstance().submit();
    }

    public async cancel(): Promise<void> {
        await ContextService.getInstance().toggleActiveContext();
    }

}

module.exports = Component;
