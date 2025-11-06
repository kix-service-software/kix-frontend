/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { Ticket } from '../../../model/Ticket';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Description', 'Translatable#Comment'
        ]);

        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        this.context.widgetService.setWidgetType('ticket-description-widget', WidgetType.GROUP);
        this.context.widgetService.setWidgetType('ticket-description-notes', WidgetType.GROUP);

        this.context?.registerListener('ticket-description-widget', {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });

        this.setWidgetContentHeight();
        await this.initWidget(await this.context?.getObject<Ticket>());
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.loading = true;
        this.state.ticket = ticket;
        await this.getFirstArticle();
        this.prepareActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    private async getFirstArticle(): Promise<void> {
        if (this.state.ticket) {
            this.state.firstArticle = this.state.ticket.getFirstArticle();
        }
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.firstArticle) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.firstArticle], this.contextInstanceId
            );
        }
    }

    private setWidgetContentHeight(): void {
        const laneWidget = (this as any).getEl();
        if (laneWidget) {
            const content = laneWidget.querySelector('.widget-content');
            if (content) {
                content.style.maxHeight = 'unset';
            }
        }
    }

    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
