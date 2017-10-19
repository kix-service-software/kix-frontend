import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { DESCRIPTION_CHANGED } from '../../store/actions';

class TicketDescriptionInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            description: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.description = reduxState.description;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.description = reduxState.description;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(DESCRIPTION_CHANGED(event.target.value));
    }

}

module.exports = TicketDescriptionInput;
