import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { LOAD_TICKET_TEMPLATES } from '../../store/actions';

class TicketTemplateInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            isLoading: false
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        this.store.dispatch(LOAD_TICKET_TEMPLATES());
    }

    public stateChanged(): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.isLoading = reduxState.loadTicketTemplates;
    }

}

module.exports = TicketTemplateInput;
