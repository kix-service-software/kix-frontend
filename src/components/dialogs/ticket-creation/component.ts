import { TicketCreationProcessReduxState } from './store/TicketCreationProcessReduxState';
import { CreationTicketStore, STATE_ID } from './store/index';
import { ClientStorageHandler, TranslationHandler, CreationDialogComponentEvent } from '@kix/core/dist/model/client';
import { TicketCreationDialogState } from './model/TicketCreationDialogState';
import { TranslationId } from './model/TranslationId';
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

    public async onMount(): Promise<void> {
        const existingState = ClientStorageHandler.loadState(STATE_ID);

        this.store = CreationTicketStore.getInstance().getStore();
        this.store.subscribe(this.stateChanged.bind(this));

        const translationHandler = await TranslationHandler.getInstance();
        const questionString = translationHandler.getTranslation(TranslationId.LOAD_DRAFT_QUESTION);

        if (existingState && !confirm(questionString)) {
            ClientStorageHandler.deleteState(STATE_ID);
            this.store.dispatch(RESET_TICKET_CREATION()).then(() => {
                this.initializeState();
            });
        } else {
            this.initializeState();
        }
    }

    public onInput(input: any) {
        this.state.createNewObjectAfterFinish = input.createNewObjectAfterFinish;
    }

    public stateChanged(): void {
        const reduxState: TicketCreationProcessReduxState = this.store.getState().ticketProcessState;
        this.state.ticketCreationInProcess = reduxState.createTicketInProcess;
        this.state.resetTicketCreationInProcess = reduxState.resetTicketCreationInProcess;

        this.state.loadData = reduxState.loadTicketData;

        this.state.error = reduxState.error;

        if (reduxState.createTicketSuccessful && reduxState.createdTicketId) {
            this.state.ticketCreated = true;
            this.state.ticketId = reduxState.createdTicketId;
            ClientStorageHandler.deleteState(STATE_ID);
            this.store.dispatch(RESET_TICKET_CREATION()).then(() => {
                this.state = {
                    ... new TicketCreationDialogState(),
                    createNewObjectAfterFinish: this.state.createNewObjectAfterFinish
                };

                if (this.state.createNewObjectAfterFinish) {
                    this.dispatchLoadTicketData();
                }
            });
            (this as any).emit(CreationDialogComponentEvent.FINISH_DIALOG);
        }
    }

    public createTicket(): void {
        const ticketState: TicketCreationReduxState = this.store.getState().ticketState;
        const processState: TicketCreationProcessReduxState = this.store.getState().ticketProcessState;
        this.store.dispatch(CREATE_TICKET(processState, ticketState));
    }

    private initializeState(): void {
        this.store.dispatch(INITIALIZE()).then(() => {
            this.dispatchLoadTicketData();
        });
    }

    private dispatchLoadTicketData(): void {
        const ticketProcessState = this.store.getState().ticketProcessState;
        this.store.dispatch(LOAD_TICKET_DATA(ticketProcessState));
    }

}

module.exports = TicketCreationDialogComponent;
