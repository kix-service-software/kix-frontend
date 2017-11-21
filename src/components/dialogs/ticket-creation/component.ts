import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { CreationDialogComponentEvent } from '@kix/core/dist/model';

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
        const existingState = ClientStorageHandler.loadState(TicketStore.getInstance().TICKET_CREATION_STATE_ID);

        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));

        const translationHandler = await TranslationHandler.getInstance();
        const questionString = translationHandler.getTranslation(TranslationId.LOAD_DRAFT_QUESTION);

        if (existingState && !confirm(questionString)) {
            ClientStorageHandler.deleteState(TicketStore.getInstance().TICKET_CREATION_STATE_ID);
            TicketStore.getInstance().resetTicketCreation(ComponentId.TICKET_CREATION_ID).then(() => {
                TicketStore.getInstance().loadTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
            });
        } else {
            TicketStore.getInstance().loadTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
        }
    }

    public onInput(input: any) {
        this.state.createNewObjectAfterFinish = input.createNewObjectAfterFinish;
    }

    public stateChanged(): void {
        const creationData = TicketStore.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.error = creationData.error;
        }
    }

    public createTicket(): void {
        TicketStore.getInstance().createTicket(ComponentId.TICKET_CREATION_ID).then(() => {
            if (this.state.createNewObjectAfterFinish) {
                TicketStore.getInstance().resetTicketCreation(ComponentId.TICKET_CREATION_ID);
                TicketStore.getInstance().loadTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
                this.state.error = null;
            }
            (this as any).emit(CreationDialogComponentEvent.FINISH_DIALOG);
        }).catch((error) => {
            this.state.error = error;
        });
    }
}

module.exports = TicketCreationDialogComponent;
