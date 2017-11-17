import { ClientStorageHandler, TranslationHandler } from '@kix/core/dist/model/client';
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';
import { CreationDialogComponentEvent } from '@kix/core/dist/model/client/components';

import { TicketCreationDialogState } from './model/TicketCreationDialogState';
import { TranslationId } from './model/TranslationId';

import { ComponentId } from './model/ComponentId';

class TicketCreationDialogComponent {

    public state: TicketCreationDialogState;

    private closeDialogAfterSuccess: boolean;


    public onCreate(input: any): void {
        this.state = new TicketCreationDialogState();
        this.closeDialogAfterSuccess = true;
    }

    public async onMount(): Promise<void> {
        this.state = new TicketCreationDialogState();
        const existingState = ClientStorageHandler.loadState(TicketStore.TICKET_CREATION_STATE_ID);

        TicketStore.addStateListener(this.stateChanged.bind(this));

        const translationHandler = await TranslationHandler.getInstance();
        const questionString = translationHandler.getTranslation(TranslationId.LOAD_DRAFT_QUESTION);

        if (existingState && !confirm(questionString)) {
            ClientStorageHandler.deleteState(TicketStore.TICKET_CREATION_STATE_ID);
            TicketStore.resetTicketCreation(ComponentId.TICKET_CREATION_ID).then(() => {
                TicketStore.loadTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
            });
        } else {
            TicketStore.loadTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
        }
    }

    public onInput(input: any) {
        this.state.createNewObjectAfterFinish = input.createNewObjectAfterFinish;
    }

    public stateChanged(): void {
        const creationData = TicketStore.getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.error = creationData.error;
        }
    }

    public createTicket(): void {
        TicketStore.createTicket(ComponentId.TICKET_CREATION_ID).then(() => {
            if (this.state.createNewObjectAfterFinish) {
                TicketStore.resetTicketCreation(ComponentId.TICKET_CREATION_ID);
                TicketStore.loadTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
                this.state.error = null;
            }
            (this as any).emit(CreationDialogComponentEvent.FINISH_DIALOG);
        }).catch((error) => {
            this.state.error = error;
        });
    }
}

module.exports = TicketCreationDialogComponent;
