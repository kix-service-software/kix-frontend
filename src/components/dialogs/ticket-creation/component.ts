import { ClientStorageHandler } from '@kix/core/dist/model/client';
import { TicketCreationDialogState } from './model/TicketCreationDialogState';
import { TicketCreationReduxState } from './store/TicketCreationReduxState';
import { CREATE_TICKET, RESET_TICKET_CREATION } from './store/actions';

class TicketCreationDialogComponent {

    public state: TicketCreationDialogState;

    private store: any;

    private closeDialogAfterSuccess: boolean;

    public onCreate(input: any): void {
        this.state = new TicketCreationDialogState();
        this.closeDialogAfterSuccess = true;
    }

    public onMount(): void {
        this.store = require('./store');
        this.store.subscribe(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.ticketCreationInProcess = reduxState.createTicketInProcess;
        this.state.resetTicketCreationInProcess = reduxState.resetTicketCreationInProcess;
    }

    public createTicket(): void {
        const closeDialog = this.closeDialogAfterSuccess;
        this.store.dispatch(CREATE_TICKET()).then(() => {
            ClientStorageHandler.deleteState('TicketCreationDialog');
            if (closeDialog) {
                (this as any).emit('closeDialog');
            } else {
                this.store.dispatch(RESET_TICKET_CREATION());
            }
        });
    }

}

module.exports = TicketCreationDialogComponent;
