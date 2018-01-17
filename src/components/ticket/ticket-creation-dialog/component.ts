import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
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
        const existingState = ClientStorageHandler.loadState(TicketService.TICKET_CREATION_STATE_ID);

        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));

        const translationHandler = await TranslationHandler.getInstance();
        const questionString = translationHandler.getTranslation(TranslationId.LOAD_DRAFT_QUESTION);

        if (existingState && !confirm(questionString)) {
            ClientStorageHandler.deleteState(TicketService.TICKET_CREATION_STATE_ID);
            TicketService.getInstance().resetTicketCreation(ComponentId.TICKET_CREATION_ID);
        }
    }

    public onInput(input: any) {
        this.state.createNewObjectAfterFinish = input.createNewObjectAfterFinish;
    }

    private ticketStateChanged(): void {
        const creationData = TicketService.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.error = creationData.error;
        }
        (this as any).setStateDirty('ticketProperties');
    }

    private getPropertyValue(property: string): any {
        const data = TicketService.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        let value = null;
        if (data) {
            if (property.startsWith('DynamicField_')) {
                const dynamicFieldName = property.substr('DynamicField_'.length + 1, property.length);
                const dynamicField = data.dynamicFields.find((df) => df.Name === dynamicFieldName);
                if (dynamicField) {
                    value = dynamicField.Value;
                }
            } else {
                value = data[property];
            }
        }
        return value;
    }

    private valueChanged(property: string, value: any): void {
        TicketService.getInstance().prepareCreateTicket(ComponentId.TICKET_CREATION_ID, [property, value]);
    }

    private createTicket(): void {
        TicketService.getInstance().createTicket(ComponentId.TICKET_CREATION_ID).then(() => {
            if (this.state.createNewObjectAfterFinish) {
                TicketService.getInstance().resetTicketCreation(ComponentId.TICKET_CREATION_ID);
                this.state.error = null;
            }
            (this as any).emit(CreationDialogComponentEvent.FINISH_DIALOG);
        }).catch((error) => {
            this.state.error = error;
        });
    }
}

module.exports = TicketCreationDialogComponent;
