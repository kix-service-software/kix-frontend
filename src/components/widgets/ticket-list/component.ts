import { WidgetBaseComponent } from '@kix/core/dist/model/client';
import { Ticket } from '@kix/core/dist/model/client/ticket';
import { TicketListComponentState } from './model/TicketListComponentState';
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';
import { DashboardStore } from '@kix/core/dist/model/client/dashboard/store/DashboardStore';
import { TicketState } from '@kix/core/dist/model/client/ticket/model/TicketState';

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
            DashboardStore.getWidgetConfiguration('ticket-list-widget', this.state.instanceId);

        this.loadTickets();
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        DashboardStore.saveWidgetConfiguration(
            'ticket-list-widget', this.state.instanceId, this.state.widgetConfiguration
        );

        this.loadTickets();
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private ticketStateChanged(): void {
        this.state.tickets = TicketStore.getTickets(this.state.instanceId);
        this.state.filteredTickets = this.state.tickets;
    }

    private loadTickets(): void {
        if (this.state.widgetConfiguration) {
            const settings = this.state.widgetConfiguration.settings;
            TicketStore.loadTickets(this.state.instanceId, settings.limit, settings.properties);
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
