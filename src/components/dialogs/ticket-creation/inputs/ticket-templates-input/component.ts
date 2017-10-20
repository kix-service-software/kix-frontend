import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { LOAD_TICKET_TEMPLATES, TEMPLATE_CHANGED } from '../../store/actions';

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
        const reduxState: TicketCreationProcessReduxState = this.store.getState().ticketProcessState;
        this.state.isLoading = reduxState.loadTicketTemplates;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(TEMPLATE_CHANGED(event.target.value));
    }

}

module.exports = TicketTemplateInput;
