import {
    TicketCreationReduxState,
    ClientStorageHandler,
    TranslationHandler,
    CreationDialogComponentEvent
} from '@kix/core/dist/model/client';

import { TicketCreationDialogState } from './model/TicketCreationDialogState';
import { TranslationId } from './model/TranslationId';
import { TicketStore } from '../../../../../core/dist/model/client/';

class TicketCreationDialogComponent {

    public state: TicketCreationDialogState;

    private closeDialogAfterSuccess: boolean;

    public onCreate(input: any): void {
        this.state = new TicketCreationDialogState();
        this.closeDialogAfterSuccess = true;
    }

    public async onMount(): Promise<void> {
        const existingState = ClientStorageHandler.loadState(TicketStore.TICKET_CREATION_STATE_ID);

        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));

        const translationHandler = await TranslationHandler.getInstance();
        const questionString = translationHandler.getTranslation(TranslationId.LOAD_DRAFT_QUESTION);

        if (existingState && !confirm(questionString)) {
            ClientStorageHandler.deleteState(TicketStore.TICKET_CREATION_STATE_ID);
            TicketStore.getInstance().resetTicketCreation().then(() => {
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
        const ticketDataState = TicketStore.getInstance().getTicketDataState();
        const ticketCreationState = TicketStore.getInstance().getTicketCreationState();
        this.state.loadData = ticketDataState.loadTicketData;

        this.state.error = ticketCreationState.error;

        if (ticketCreationState.ticketCreationSuccessful && ticketCreationState.createdTicketId) {
            this.state.ticketCreated = true;
            this.state.ticketId = ticketCreationState.createdTicketId;
            ClientStorageHandler.deleteState(TicketStore.TICKET_CREATION_STATE_ID);
            TicketStore.getInstance().resetTicketCreation().then(() => {
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
        TicketStore.getInstance().createTicket();
    }

    private initializeState(): void {
        this.dispatchLoadTicketData();
    }

    private dispatchLoadTicketData(): void {
        TicketStore.getInstance().loadTicketData();
    }

}

module.exports = TicketCreationDialogComponent;
