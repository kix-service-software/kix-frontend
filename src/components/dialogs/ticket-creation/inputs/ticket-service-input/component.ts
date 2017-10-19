import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { SERVICE_ID_CHANGED } from '../../store/actions';

class TicketServiceInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            serviceId: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.serviceId = reduxState.serviceId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.serviceId = reduxState.serviceId;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(SERVICE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketServiceInput;
