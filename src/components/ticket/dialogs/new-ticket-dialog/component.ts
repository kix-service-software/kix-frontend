/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, BrowserUtil, FormService } from '../../../../core/browser';
import {
    KIXObjectType, ContextMode, TicketProperty, Ticket, ArticleProperty, FormField, FormFieldValue
} from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { TicketDetailsContext } from '../../../../core/browser/ticket';
import { RoutingConfiguration } from '../../../../core/browser/router';
import { AbstractNewDialog } from '../../../../core/browser/components/dialog';
import { EventService } from '../../../../core/browser/event';
import { ApplicationEvent } from '../../../../core/browser/application';

class Component extends AbstractNewDialog {

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

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.registerListener({
                formListenerId: 'new-article-dialog-listener',
                formValueChanged: async (formField: FormField, value: FormFieldValue<any>, oldValue: any) => {
                    if (formField.property === ArticleProperty.CHANNEL_ID) {
                        if (value && value.value === 2) {
                            this.state.buttonLabel = 'Translatable#Send';
                        } else {
                            this.state.buttonLabel = 'Translatable#Save';
                        }
                    }
                },
                updateForm: () => { return; }
            });
        }

        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit().then(async () => {
            const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
            const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]);
            if (ticket) {
                const article = [...ticket.Articles].sort((a, b) => b.ArticleID - a.ArticleID)[0];
                if (article.isUnsent()) {
                    BrowserUtil.openErrorOverlay(article.getUnsentError());
                }
            }
            EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR);
        });
    }

}

module.exports = Component;
