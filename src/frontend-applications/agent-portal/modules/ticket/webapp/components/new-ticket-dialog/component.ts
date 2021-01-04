/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ComponentState } from './ComponentState';
import { AbstractNewDialog } from '../../../../../modules/base-components/webapp/core/AbstractNewDialog';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { TicketDetailsContext } from '../../core';
import { ContextMode } from '../../../../../model/ContextMode';
import { TicketProperty } from '../../../model/TicketProperty';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { FormService } from '../../../../base-components/webapp/core/FormService';

class Component extends AbstractNewDialog {

    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Ticket',
            'Translatable#Ticket successfully created.',
            KIXObjectType.TICKET,
            new RoutingConfiguration(
                TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                ContextMode.DETAILS, TicketProperty.TICKET_ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: 'NewTicketDialog',
            eventPublished: (data: FormValuesChangedEventData, eventId: string) => {
                const channelValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === ArticleProperty.CHANNEL_ID
                );

                if (channelValue && channelValue[1]) {
                    const channelId = channelValue[1].value;
                    this.setSubmitButtonLabel(channelId);
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        this.setSubmitButtonLabel();
        this.state.loading = false;
    }

    private async setSubmitButtonLabel(channelId?: number): Promise<void> {
        if (!channelId) {
            const formId = this.state.formId;
            if (formId) {
                const formInstance = await FormService.getInstance().getFormInstance(formId);
                if (formInstance) {
                    const value = await formInstance.getFormFieldValueByProperty<number>(
                        ArticleProperty.CHANNEL_ID
                    );
                    if (value && value.value) {
                        channelId = value.value;
                    }
                }
            }
        }

        if (channelId === 2) {
            this.state.buttonLabel = 'Translatable#Send';
        } else {
            this.state.buttonLabel = 'Translatable#Save';
        }
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit().then(async () => {
            // const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
            // const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]);
            // if (ticket) {
            //     const article = [...ticket.Articles].sort((a, b) => b.ArticleID - a.ArticleID)[0];
            //     if (article.isUnsent()) {
            //         BrowserUtil.openErrorOverlay(article.getUnsentError());
            //     }
            // }
        });
    }

}

module.exports = Component;
