import { WidgetBaseComponent, Ticket } from '@kix/core/dist/model/client';

import { TicketListComponentState } from './model/TicketListComponentState';
import { TicketListReduxState } from './store/';
import { LOAD_TICKETS, TICKET_LIST_INITIALIZE } from './store/actions/';

class TicketListWidgetComponent extends WidgetBaseComponent<TicketListComponentState, TicketListReduxState> {

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
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(TICKET_LIST_INITIALIZE(this.store, 'ticket-list-widget', this.state.instanceId))
            .then(() => {
                this.loadTickets();
            });
    }

    public stateChanged(): void {
        super.stateChanged();

        const reduxState: TicketListReduxState = this.store.getState();

        if (reduxState.tickets) {
            this.state.tickets = reduxState.tickets;
            this.state.filteredTickets = reduxState.tickets;
        }

        if (reduxState.widgetConfiguration) {
            if (!this.componentInitialized) {
                this.componentInitialized = true;
                this.loadTickets();
            }
        }
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        const reduxState: TicketListReduxState = this.store.getState();
        reduxState.socketListener.saveWidgetContentConfiguration(this.state.widgetConfiguration);
        this.loadTickets();
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private loadTickets(): void {
        if (this.state.widgetConfiguration) {
            const config = this.state.widgetConfiguration.contentConfiguration;
            this.store.dispatch(LOAD_TICKETS(this.store, config.limit, config.properties));
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
