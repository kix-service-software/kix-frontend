import { TicketListComponentState } from './model/TicketListComponentState';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import {
    TicketDetails, ContextFilter, Context, ObjectType, Ticket, TicketState, TicketProperty
} from '@kix/core/dist/model/';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { TicketService, TicketData, TicketNotification } from '@kix/core/dist/browser/ticket/';

class TicketListWidgetComponent {

    public state: TicketListComponentState;

    protected store: any;

    private componentInitialized: boolean = false;

    public onCreate(input: any): void {
        this.state = new TicketListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));

        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.loadTickets();
    }

    public contextServiceNotified(requestId: string, type: ContextNotification, ...args) {
        if (type === ContextNotification.CONTEXT_FILTER_CHANGED) {
            const contextFilter: ContextFilter = args[0];
            if (contextFilter) {
                this.filter(contextFilter);
            }
        } else if (type === ContextNotification.CONTEXT_UPDATED) {
            const context = ContextService.getInstance().getContext();
            this.state.widgetConfiguration =
                context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
            this.loadTickets();
        } else if (type === ContextNotification.OBJECT_LIST_UPDATED) {
            const tickets: Ticket[] = args[0];
            if (requestId === this.state.instanceId && tickets) {
                this.state.tickets = tickets;
                this.state.filteredTickets = tickets;
            }
        }
    }

    private loadTickets(): void {
        if (this.state.widgetConfiguration) {
            const settings = this.state.widgetConfiguration.settings;
            if (settings.properties.findIndex((p) => p === TicketProperty.QUEUE_ID) < 0) {
                settings.properties.push(TicketProperty.QUEUE_ID);
            }
            TicketService.getInstance().searchTickets(this.state.instanceId, settings.limit, settings.properties);
        }
    }

    private filterChanged(event): void {
        this.state.filterValue = event.target.value;
    }

    private filter(contextFilter: ContextFilter): void {
        let usedContextFilter = false;
        if (
            this.state.widgetConfiguration &&
            this.state.widgetConfiguration.contextDependent &&
            contextFilter.objectType === ObjectType.QUEUE &&
            contextFilter.objectValue
        ) {
            this.state.filteredTickets =
                this.state.tickets.filter((t) => t.QueueID === contextFilter.objectValue);

            usedContextFilter = true;
        }


        if (this.state.filterValue !== null && this.state.filterValue !== "") {
            const searchValue = this.state.filterValue.toLocaleLowerCase();

            const tickets = usedContextFilter ? this.state.filteredTickets : this.state.tickets;

            this.state.filteredTickets = tickets.filter((ticket: Ticket) => {
                const foundTitle = ticket.Title.toLocaleLowerCase().indexOf(searchValue) !== -1;
                const foundTicketNumber = ticket.TicketNumber.toLocaleLowerCase().indexOf(searchValue) !== -1;
                return foundTitle || foundTicketNumber;
            });
        } else if (!usedContextFilter) {
            this.state.filteredTickets = this.state.tickets;
        }

        (this as any).setStateDirty('filteredTickets');
    }

}

module.exports = TicketListWidgetComponent;
