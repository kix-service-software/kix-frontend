import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { USER_ID_CHANGED } from '../../store/actions';

class TicketUserInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        // TODO: USER CHANGED check user type
    }

    public valueChanged(event: any): void {
        this.store.dispatch(USER_ID_CHANGED(event.target.value, 'owner'));
    }

}

module.exports = TicketUserInput;
