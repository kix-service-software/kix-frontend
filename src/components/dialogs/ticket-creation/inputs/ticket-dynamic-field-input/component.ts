import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { DYNAMIC_FIELD_CHANGED } from '../../store/actions';

class TicketDynamicFieldInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        // TODO: DYNAMIC FIELD
    }

    public valueChanged(event: any): void {
        this.store.dispatch(DYNAMIC_FIELD_CHANGED('name', event.target.value));
    }

}

module.exports = TicketDynamicFieldInput;
