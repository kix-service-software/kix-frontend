/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent, ActionFactory, ContextService } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TicketPriority, KIXObjectType } from '../../../../../core/model';
import { TicketPriorityLabelProvider, TicketPriorityDetailsContext } from '../../../../../core/browser/ticket';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketPriorityLabelProvider();
        const context = await ContextService.getInstance().getContext<TicketPriorityDetailsContext>(
            TicketPriorityDetailsContext.CONTEXT_ID
        );
        context.registerListener('ticket-priority-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, ticketPriority: TicketPriority, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET_PRIORITY) {
                    this.initWidget(ticketPriority);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<TicketPriority>());
    }

    private async initWidget(ticketPriority: TicketPriority): Promise<void> {
        this.state.ticketPriority = ticketPriority;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.ticketPriority) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticketPriority]
            );
        }
    }

}

module.exports = Component;
