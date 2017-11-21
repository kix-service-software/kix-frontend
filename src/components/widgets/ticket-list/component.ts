import { TicketListComponentState } from './model/TicketListComponentState';
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { Ticket, TicketState } from '@kix/core/dist/model/';

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
        TicketStore.addStateListener(this.ticketStateChanged.bind(this));
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration('ticket-list-widget', this.state.instanceId);

        this.loadTickets();
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        DashboardStore.getInstance().saveWidgetConfiguration(
            'ticket-list-widget', this.state.instanceId, this.state.widgetConfiguration
        );

        this.loadTickets();
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private ticketStateChanged(): void {
        const tickets = TicketStore.getTicketsSearchResult(this.state.instanceId);
        if (tickets) {
            this.state.tickets = tickets;
            this.state.filteredTickets = tickets;
        }

    }

    private loadTickets(): void {
        if (this.state.widgetConfiguration) {
            const settings = this.state.widgetConfiguration.settings;
            TicketStore.searchTickets(this.state.instanceId, settings.limit, settings.properties);
        }
    }

    private filterChanged(event): void {
        this.filter(event.target.value);
    }

    private filter(value: string): void {
        this.state.filterValue = value;

        if (value === null || value === "") {
            this.state.filteredTickets = this.state.tickets;
        } else {
            const searchValue = value.toLocaleLowerCase();
            this.state.filteredTickets = this.state.tickets.filter((ticket: Ticket) => {
                const foundTitle = ticket.Title.toLocaleLowerCase().indexOf(searchValue) !== -1;
                const foundTicketNumber = ticket.TicketNumber.toLocaleLowerCase().indexOf(searchValue) !== -1;
                return foundTitle || foundTicketNumber;
            });
        }

        (this as any).setStateDirty('filteredTickets');
    }

}

module.exports = TicketListWidgetComponent;
