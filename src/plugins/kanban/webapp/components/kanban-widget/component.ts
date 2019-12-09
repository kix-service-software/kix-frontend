/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent
} from '../../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/AbstractMarkoComponent';
import { FilterCriteria } from '../../../../../frontend-applications/agent-portal/model/FilterCriteria';
import { TicketProperty } from '../../../../../frontend-applications/agent-portal/modules/ticket/model/TicketProperty';
import { SearchOperator } from '../../../../../frontend-applications/agent-portal/modules/search/model/SearchOperator';
import { FilterDataType } from '../../../../../frontend-applications/agent-portal/model/FilterDataType';
import { FilterType } from '../../../../../frontend-applications/agent-portal/model/FilterType';
import {
    KIXObjectService
} from '../../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../../../frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { KIXObjectType } from '../../../../../frontend-applications/agent-portal/model/kix/KIXObjectType';
import {
    KIXObjectLoadingOptions
} from '../../../../../frontend-applications/agent-portal/model/KIXObjectLoadingOptions';
import {
    LabelService
} from '../../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { SysConfigService } from '../../../../../frontend-applications/agent-portal/modules/sysconfig/webapp/core';


declare const jKanban: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private kanban: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const stateTypes = await SysConfigService.getInstance().getTicketViewableStateTypes();

        const stateTypeFilterCriteria = new FilterCriteria(
            TicketProperty.STATE_TYPE, SearchOperator.IN, FilterDataType.STRING, FilterType.AND, stateTypes
        );

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, null, new KIXObjectLoadingOptions([stateTypeFilterCriteria])
        );

        this.state.prepared = true;

        setTimeout(() => this.createBoard(tickets), 50);
    }

    private async createBoard(tickets: Ticket[]): Promise<void> {
        const boards = [];

        for (const ticket of tickets) {
            let board = boards.find((b) => b.id === ticket.StateID.toString());
            if (!board) {
                const state = await LabelService.getInstance().getPropertyValueDisplayText(
                    ticket, TicketProperty.STATE_ID
                );
                board = {
                    id: ticket.StateID.toString(),
                    title: state,
                    item: [],
                    dragTo: [],
                    class: ''
                };
                boards.push(board);
            }

            const ticketTitle = await LabelService.getInstance().getText(ticket);
            board.item.push({
                id: ticket.TicketID.toString(),
                title: ticketTitle
            });

        }

        boards.forEach((b) => {
            if (b.id === "1") {
                b.class = 'kanban-new';
                b.dragTo = ["2", "3", "close"];
            } else if (b.id === "2") {
                b.class = 'kanban-open';
                b.dragTo = ["1", "3", "close"];
            } else if (b.id === "3") {
                b.class = 'kanban-pending';
                b.dragTo = ["1", "2", "close"];
            }

        });

        this.kanban = new jKanban({
            element: '#kanban-board',
            gutter: '15px',
            widthBoard: '250px',
            responsivePercentage: true,
            dragItems: true,
            boards,
            dragBoards: true,
            addItemButton: false,
            buttonContent: '+',
            itemHandleOptions: {
                enabled: true,
            }
        });
    }

    public addCloseBoard(): void {
        if (this.kanban) {
            this.kanban.addBoards([
                {
                    id: "close",
                    title: "Finished",
                    item: [],
                    class: 'kanban-finished'
                }
            ]);
        }
    }

}

module.exports = Component;
