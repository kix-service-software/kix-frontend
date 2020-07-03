/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { TicketDetailsContext } from '../../core';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractEditDialog } from '../../../../base-components/webapp/core/AbstractEditDialog';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';

class Component extends AbstractEditDialog {

    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Ticket',
            undefined,
            KIXObjectType.TICKET,
            TicketDetailsContext.CONTEXT_ID
        );
    }

    public async onMount(): Promise<void> {
        super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Save'
        ]);

        this.formSubscriber = {
            eventSubscriberId: 'EditTicketDialog',
            eventPublished: (data: FormValuesChangedEventData, eventId: string) => {
                const channelValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === ArticleProperty.CHANNEL_ID
                );

                if (channelValue && channelValue[1]) {
                    const channelId = channelValue[1].value;
                    if (channelId === 2) {
                        this.state.buttonLabel = 'Translatable#Send';
                    } else {
                        this.state.buttonLabel = 'Translatable#Save';
                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async cancel(): Promise<void> {
        super.cancel();
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async submit(): Promise<void> {
        super.submit();
    }

}

module.exports = Component;
