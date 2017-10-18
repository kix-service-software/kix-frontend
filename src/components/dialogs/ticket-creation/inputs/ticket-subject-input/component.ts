import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { SUBJECT_CHANGED } from '../../store/actions';

class TicketSubjectInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            subject: ''
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.subject = reduxState.subject;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.subject = reduxState.subject;
    }

    public subjectChanged(event: any): void {
        this.store.dispatch(SUBJECT_CHANGED(event.target.value));
    }

}

module.exports = TicketSubjectInput;
