import { TicketCreationProcessReduxState } from './store/TicketCreationProcessReduxState';
import { CreationTicketStore } from './store/index';
import { ClientStorageHandler } from '@kix/core/dist/model/client';
import { TicketCreationDialogState } from './model/TicketCreationDialogState';
import { TicketCreationReduxState } from './store/TicketCreationReduxState';
import { INITIALIZE, CREATE_TICKET, RESET_TICKET_CREATION, LOAD_TICKET_DATA } from './store/actions';

class TicketCreationDialogComponent {

    public state: TicketCreationDialogState;

    private store: any;

    private closeDialogAfterSuccess: boolean;

    public onCreate(input: any): void {
        this.state = new TicketCreationDialogState();
        this.closeDialogAfterSuccess = true;
    }

    public onMount(): void {
        CreationTicketStore.INSTANCE.initialize();
        this.store = CreationTicketStore.INSTANCE.getStore();
        this.store.subscribe(this.stateChanged.bind(this));

        this.store.dispatch(INITIALIZE()).then(() => {
            const ticketProcessState = this.store.getState().ticketProcessState;
            this.store.dispatch(LOAD_TICKET_DATA(ticketProcessState));
        });
    }

    public stateChanged(): void {
        const reduxState: TicketCreationProcessReduxState = this.store.getState().ticketProcessState;
        this.state.ticketCreationInProcess = reduxState.createTicketInProcess;
        this.state.resetTicketCreationInProcess = reduxState.resetTicketCreationInProcess;

        // handle Ticket Created
        // ClientStorageHandler.deleteState('TicketCreationDialog');
        // if (closeDialog) {
        //     (this as any).emit('closeDialog');
        // } else {
        //     this.store.dispatch(RESET_TICKET_CREATION());
        // }
    }

    public createTicket(): void {
        const ticketState: TicketCreationReduxState = this.store.getState().ticketState;
        const processState: TicketCreationProcessReduxState = this.store.getState().ticketProcessState;

        this.store.dispatch(CREATE_TICKET(processState, ticketState));
    }

}

module.exports = TicketCreationDialogComponent;
