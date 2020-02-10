/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from "../../../../base-components/webapp/core/AbstractMarkoComponent";
import { ComponentState } from "./ComponentState";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { TicketProperty } from "../../../../ticket/model/TicketProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { KIXObjectService } from "../../../../base-components/webapp/core/KIXObjectService";
import { Ticket } from "../../../../ticket/model/Ticket";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { AgentService } from "../../../../user/webapp/core/AgentService";
import { TranslationService } from "../../../../translation/webapp/core/TranslationService";
import { KIXModulesService } from "../../../../base-components/webapp/core/KIXModulesService";
import { ApplicationEvent } from "../../../../base-components/webapp/core/ApplicationEvent";
import { EventService } from "../../../../base-components/webapp/core/EventService";
import { DateTimeUtil } from "../../../../base-components/webapp/core/DateTimeUtil";
import { ContextService } from "../../../../base-components/webapp/core/ContextService";
import { KanbanConfiguration } from "../../core/KanbanConfiguration";
import { KanbanEvent } from "../../core/KanbanEvent";
import { KIXObjectProperty } from "../../../../../model/kix/KIXObjectProperty";

declare const jKanban: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private kanban: any;

    private boards: any[] = [];
    private kanbanConfig: KanbanConfiguration;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            const widgetConfiguration = context.getWidgetConfiguration(this.state.instanceId);
            if (widgetConfiguration && widgetConfiguration.configuration) {
                this.kanbanConfig = (widgetConfiguration.configuration as KanbanConfiguration);
                this.state.prepared = true;
                setTimeout(() => this.createKanbanBoard(), 50);
            }
        }
    }

    private async createKanbanBoard(): Promise<void> {
        this.boards = [];

        const teamTickets = await this.createTicketBoard(false, 'new', 'team-backlog', 'Translatable#Team Backlog');
        const personalTickets = await this.createTicketBoard(
            true, 'new', 'personal-backlog', 'Translatable#Personal Backlog'
        );
        const wipTickets = await this.createTicketBoard(true, 'open', 'wip', 'Translatable#Work in Progress');
        const pendingTickets = await this.createTicketBoard(
            true, 'pending reminder', 'pending', 'Translatable#Pending'
        );
        const closedTickets = await this.createTicketBoard(
            true, 'closed', 'closed', 'Translatable#Recently Closed', true
        );

        this.kanban = new jKanban({
            element: '#kanban-board',
            gutter: '15px',
            widthBoard: '250px',
            responsivePercentage: true,
            dragItems: true,
            boards: this.boards,
            dragBoards: false,
            addItemButton: false,
            itemHandleOptions: {
                enabled: false,
            },
            dropEl: this.dropTicket.bind(this)
        });

        setTimeout(() => {
            teamTickets.forEach((t) => this.createItem(t));
            personalTickets.forEach((t) => this.createItem(t));
            wipTickets.forEach((t) => this.createItem(t));
            pendingTickets.forEach((t) => this.createItem(t));
            closedTickets.forEach((t) => this.createItem(t));
        }, 50);
    }

    private async dropTicket(el, target, source, sibling): Promise<void> {
        const board = target.parentElement.getAttribute('data-id');

        const user = await AgentService.getInstance().getCurrentUser();

        const parameter = [];

        const column = this.kanbanConfig.columns.find((c) => c.id === board);
        parameter.push([TicketProperty.STATE, column.dropState]);

        if (board === 'team-backlog') {
            parameter.push([TicketProperty.OWNER_ID, 1]);
            parameter.push([TicketProperty.LOCK_ID, 1]);
        } else if (board === 'personal-backlog') {
            parameter.push([TicketProperty.OWNER_ID, user.UserID]);
        } else if (board === 'wip') {
            parameter.push([TicketProperty.OWNER_ID, user.UserID]);
        } else if (board === 'pending') {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            parameter.push([TicketProperty.PENDING_TIME, DateTimeUtil.getKIXDateTimeString(date)]);
            parameter.push([TicketProperty.OWNER_ID, user.UserID]);
        } else if (board === 'closed') {
            parameter.push([TicketProperty.OWNER_ID, user.UserID]);
        }

        const ticketId = el.dataset.ticketid;
        await KIXObjectService.updateObject(KIXObjectType.TICKET, parameter, ticketId);

        EventService.getInstance().publish(
            KanbanEvent.TICKET_CHANGED, { ticketId }
        );
    }

    private async createTicketBoard(
        useUser: boolean, stateType: string, boardId: string, title: string, oneDay?: boolean
    ): Promise<Ticket[]> {
        const tickets = await this.loadBoardTickets(useUser, stateType, oneDay);
        await this.createBoard(boardId, title, tickets);
        return tickets;
    }

    private async loadBoardTickets(useUser: boolean, stateType: string, oneDay?: boolean): Promise<Ticket[]> {
        let userId = 1;
        if (useUser) {
            const user = await AgentService.getInstance().getCurrentUser();
            userId = user.UserID;
        }

        const userFilter = new FilterCriteria(
            TicketProperty.OWNER_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, userId
        );

        const filter = [
            new FilterCriteria(
                TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, stateType
            ),
            userFilter
        ];

        if (oneDay) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 1);
            const filterDate = DateTimeUtil.getKIXDateTimeString(currentDate);
            filter.push(
                new FilterCriteria(
                    TicketProperty.CLOSE_TIME, SearchOperator.GREATER_THAN_OR_EQUAL,
                    FilterDataType.DATETIME, FilterType.AND, filterDate
                )
            );
        }

        const loadingOptions = new KIXObjectLoadingOptions(filter, null, null, [KIXObjectProperty.DYNAMIC_FIELDS]);
        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, null, loadingOptions
        );

        return tickets;
    }

    private async createBoard(id: string, title: string, tickets: Ticket[]): Promise<void> {
        const boardTitle = await TranslationService.translate(title);
        const board = {
            id, title: boardTitle, item: [], class: ''
        };

        for (const ticket of tickets) {
            const item = this.createBaseItem(ticket);
            board.item.push(item);
        }

        this.boards.push(board);
    }

    private createBaseItem(ticket: Ticket): any {
        const item = {
            id: ticket.TicketID.toString(),
            ticketId: ticket.TicketID,
            title: `<div id="ticket-${ticket.TicketID}"/>`
        };
        return item;
    }

    private async createItem(ticket: Ticket): Promise<void> {
        const template = KIXModulesService.getComponentTemplate('kanban-item');
        const content = template.renderSync({ ticket, kanbanConfig: this.kanbanConfig });

        const item = document.getElementById(`ticket-${ticket.TicketID}`);
        content.appendTo(item);
    }

}

module.exports = Component;
