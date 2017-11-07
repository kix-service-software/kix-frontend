import { WidgetBaseComponent } from '../../../../../core/dist/index';
import { TicketListComponentState } from './model/TicketListComponentState';
import { TicketListReduxState } from './store/';
import { TICKET_LIST_INITIALIZE } from './store/actions/';

class TicketListWidgetComponent extends WidgetBaseComponent<TicketListComponentState, TicketListReduxState> {

    public state: any;

    protected store: any;

    public onCreate(input: any): void {
        this.state = new TicketListComponentState();
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(TICKET_LIST_INITIALIZE(this.store, 'ticket-list-widget', this.state.instanceId))
            .then(() => {
                // this.loadTicket();
            });
    }

    public stateChanged(): void {
        super.stateChanged();
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = TicketListWidgetComponent;
