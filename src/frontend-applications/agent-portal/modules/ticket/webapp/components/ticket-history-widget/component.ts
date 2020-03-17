/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketDetailsContext } from '../../core';
import { Ticket } from '../../../model/Ticket';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('ticket-history-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            },
            additionalInformationChanged: () => { return; }
        });

        await this.initWidget(await context.getObject<Ticket>());
    }

    public onDestroy(): void {
        TableFactoryService.getInstance().destroyTable('ticket-history');
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        if (ticket) {
            this.prepareActions(ticket);
            await this.prepareTable();
        }
    }

    private async prepareActions(ticket: Ticket): Promise<void> {
        if (this.state.widgetConfiguration && ticket) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [ticket]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'ticket-history', KIXObjectType.TICKET_HISTORY, null, null, TicketDetailsContext.CONTEXT_ID
        );

        this.state.table = table;
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

}

module.exports = Component;
