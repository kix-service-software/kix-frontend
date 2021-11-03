/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KanbanConfiguration } from '../../core/KanbanConfiguration';
import { KanbanEvent } from '../../core/KanbanEvent';
import { TicketState } from '../../../../ticket/model/TicketState';
import { TicketStateProperty } from '../../../../ticket/model/TicketStateProperty';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { Ticket } from '../../../../ticket/model/Ticket';

declare const jKanban: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private dragTo: string[];

    private boards: any[] = [];
    private widgetConfiguration: WidgetConfiguration;
    private kanbanConfig: KanbanConfiguration;
    private contextListenerId: string;

    private isCreatingBoard: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            this.widgetConfiguration = await context.getWidgetConfiguration(this.state.instanceId);
            if (this.widgetConfiguration && this.widgetConfiguration.configuration) {
                this.kanbanConfig = (this.widgetConfiguration.configuration as KanbanConfiguration);
                this.state.prepared = true;
                setTimeout(() => this.createKanbanBoard(), 50);
            }

            if (this.widgetConfiguration.contextDependent) {
                this.contextListenerId = 'kanban-widget' + this.widgetConfiguration.instanceId;
                context.registerListener(this.contextListenerId, {
                    additionalInformationChanged: () => null,
                    sidebarLeftToggled: () => null,
                    filteredObjectListChanged: () => {
                        this.state.prepared = false;

                        setTimeout(() => {
                            this.state.prepared = true;
                            setTimeout(() => {
                                this.createKanbanBoard();
                            }, 50);
                        }, 50);

                    },
                    objectChanged: () => null,
                    objectListChanged: () => null,
                    scrollInformationChanged: () => null,
                    sidebarRightToggled: () => null
                });
            }

        }
    }

    public onDestroy(): void {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.unregisterListener(this.contextListenerId);
        }
    }

    private async createKanbanBoard(): Promise<void> {
        if (this.isCreatingBoard) {
            return;
        }

        this.isCreatingBoard = true;
        this.dragTo = [];
        this.boards = [];

        for (const col of this.kanbanConfig.columns) {
            const loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    TicketStateProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, col.dropState
                )
            ]);
            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null, loadingOptions
            );

            if (states && states.length && states[0].ValidID === 1) {
                this.dragTo.push(col.id);
            }
        }

        let teamTickets: Ticket[];
        if (this.kanbanConfig.columns.some((c) => c.id === 'team-backlog')) {
            teamTickets = await this.createTicketBoard(false, 'new', 'team-backlog', 'Translatable#Team Backlog');
        }

        let personalTickets: Ticket[];
        if (this.kanbanConfig.columns.some((c) => c.id === 'personal-backlog')) {
            personalTickets = await this.createTicketBoard(
                !this.widgetConfiguration.contextDependent, 'new', 'personal-backlog', 'Translatable#Personal Backlog'
            );
        }

        let wipTickets: Ticket[];
        if (this.kanbanConfig.columns.some((c) => c.id === 'wip')) {
            wipTickets = await this.createTicketBoard(
                !this.widgetConfiguration.contextDependent, 'open', 'wip', 'Translatable#Work in Progress'
            );
        }

        let pendingTickets: Ticket[];
        if (this.kanbanConfig.columns.some((c) => c.id === 'pending')) {
            pendingTickets = await this.createTicketBoard(
                !this.widgetConfiguration.contextDependent, 'pending reminder', 'pending', 'Translatable#Pending'
            );
        }

        let closedTickets: Ticket[];
        if (this.kanbanConfig.columns.some((c) => c.id === 'closed')) {
            closedTickets = await this.createTicketBoard(
                !this.widgetConfiguration.contextDependent, 'closed', 'closed', 'Translatable#Recently Closed', true
            );
        }

        // tslint:disable-next-line: no-unused-expression
        new jKanban({
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

        setTimeout(async () => {
            if (Array.isArray(teamTickets)) {
                teamTickets.forEach((t) => this.createItem(t));
            }

            if (Array.isArray(personalTickets)) {
                personalTickets.forEach((t) => this.createItem(t));
            }

            if (Array.isArray(wipTickets)) {
                wipTickets.forEach((t) => this.createItem(t));
            }

            if (Array.isArray(pendingTickets)) {
                pendingTickets.forEach((t) => this.createItem(t));
            }

            if (Array.isArray(closedTickets)) {
                closedTickets.forEach((t) => this.createItem(t));
            }

            this.isCreatingBoard = false;
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
        await KIXObjectService.updateObject(KIXObjectType.TICKET, parameter, ticketId)
            .catch(() => null);

        if (this.widgetConfiguration.contextDependent) {
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                context.reloadObjectList(KIXObjectType.TICKET, false);
            }
        }

        EventService.getInstance().publish(
            KanbanEvent.TICKET_CHANGED, { ticketId }
        );
    }

    private async createTicketBoard(
        useUser: boolean, stateType: string, boardId: string, title: string, oneDay?: boolean
    ): Promise<Ticket[]> {
        let tickets: Ticket[] = [];

        if (this.widgetConfiguration.contextDependent) {
            const context = ContextService.getInstance().getActiveContext();
            const alltickets = context.getFilteredObjectList<Ticket>(KIXObjectType.TICKET);
            tickets = alltickets.filter((t) => t.StateType === stateType);
        } else {
            tickets = await this.loadBoardTickets(useUser, stateType, oneDay);
        }

        tickets = tickets.sort((a, b) => {
            if (a.OwnerID === b.OwnerID) {
                return b.PriorityID - a.PriorityID;
            }
            return b.OwnerID - a.OwnerID;
        });

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

        const loadingOptions = new KIXObjectLoadingOptions(filter);
        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, null, loadingOptions
        );

        return tickets;
    }

    private async createBoard(id: string, title: string, tickets: Ticket[]): Promise<void> {
        const boardTitle = await TranslationService.translate(title);
        const board = {
            id, title: boardTitle, item: [], class: '', dragTo: this.dragTo
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
