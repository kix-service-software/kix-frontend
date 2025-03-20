/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener('ticket-history-widget', {
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

        await this.initWidget(await context.getObject<Ticket>());
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        if (ticket) {
            await this.prepareTable();
            this.prepareActions(ticket);
        }
    }

    private async prepareActions(ticket: Ticket): Promise<void> {
        if (this.state.widgetConfiguration && ticket) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, this.state.table
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
