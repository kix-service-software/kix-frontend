import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { SUBJECT_CHANGED } from '../../store/actions';

class TicketSubjectInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            subject: ''
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.subject = reduxState.subject;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.subject = reduxState.subject;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(SUBJECT_CHANGED(event.target.value));
    }

}

module.exports = TicketSubjectInput;
