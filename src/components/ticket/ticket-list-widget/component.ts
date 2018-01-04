import { TicketListComponentState } from './model/TicketListComponentState';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { Ticket, TicketState, TicketProperty } from '@kix/core/dist/model/';
import { ContextStore } from '@kix/core/dist/browser/context/ContextStore';

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
        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        DashboardStore.getInstance().addStateListener(this.dashboardStoreChanged.bind(this));
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);

        ContextStore.getInstance().addStateListener(this.filter.bind(this));

        this.loadTickets();
    }

    private ticketStateChanged(): void {
        const tickets = TicketService.getInstance().getTicketsSearchResult(this.state.instanceId);
        if (tickets) {
            this.state.tickets = tickets;
            this.state.filteredTickets = tickets;
        }
    }

    private dashboardStoreChanged(): void {
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);

        this.loadTickets();
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

    private filter(): void {
        let usedContextFilter = false;
        if (this.state.widgetConfiguration && this.state.widgetConfiguration.contextDependent) {
            const contextFilter = ContextStore.getInstance().getContextFilter();
            // TODO: use enum for objectType
            if (contextFilter && contextFilter.objectType === 'Queue' && contextFilter.objectValue) {
                this.state.filteredTickets =
                    this.state.tickets.filter((t) => t.QueueID === contextFilter.objectValue);
                usedContextFilter = true;
            }
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
