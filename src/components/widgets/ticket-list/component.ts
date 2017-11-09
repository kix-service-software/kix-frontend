import { WidgetBaseComponent } from '@kix/core/dist/model/client';

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
}

module.exports = TicketListWidgetComponent;
