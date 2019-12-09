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
import {
    KIXObjectType
} from '../../../../../frontend-applications/agent-portal/model/kix/KIXObjectType';
import {
    KIXObjectLoadingOptions
} from '../../../../../frontend-applications/agent-portal/model/KIXObjectLoadingOptions';


declare const tui: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private calendar: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const stateTypeFilterCriteria = new FilterCriteria(
            TicketProperty.STATE_TYPE, SearchOperator.IN, FilterDataType.STRING, FilterType.AND,
            ["pending reminder"]
        );

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, null, new KIXObjectLoadingOptions([stateTypeFilterCriteria])
        );

        this.state.prepared = true;

        setTimeout(() => this.createCalendar(tickets), 50);
    }

    private async createCalendar(tickets: Ticket[]): Promise<void> {
        this.calendar = new tui.Calendar('#calendar', {
            defaultView: 'month',
            taskView: true,
            month: {
                moreLayerSize: {
                    height: 'auto'
                },
                grid: {
                    header: {
                        header: 34
                    },
                    footer: {
                        height: 10
                    }
                },
                narrowWeekend: true,
                startDayOfWeek: 1, // monday
                visibleWeeksCount: 3,
                visibleScheduleCount: 10
            }
        });

        for (const ticket of tickets) {
            const startDate = new Date(ticket.Created);
            const endDate = new Date(ticket.PendingTime);
            this.calendar.createSchedules(
                [
                    {
                        id: ticket.TicketID,
                        calendarId: '1',
                        title: ticket.Title,
                        category: 'time',
                        dueDateClass: '',
                        start: startDate,
                        end: endDate
                    }
                ]
            );
        }
    }

    public changeView(): void {
        if (this.state.view === 'week') {
            this.calendar.changeView('week', true);
            this.state.view = 'month';
        } else {
            this.state.view = 'week';
            this.calendar.changeView('month', true);
        }
    }

}

module.exports = Component;
