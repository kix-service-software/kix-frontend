import { TicketStore, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/";
import { SUBJECT_CHANGED } from '@kix/core/dist/model/client/';

class TicketSubjectInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            subject: ''
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(SUBJECT_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getInstance().getTicketCreationState();
        this.state.subject = reduxState.subject;
    }

}

module.exports = TicketSubjectInput;
