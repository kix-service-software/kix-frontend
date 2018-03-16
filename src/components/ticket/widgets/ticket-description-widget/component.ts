import { TicketDescriptionComponentState } from './TicketDescriptionComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { Attachment } from '@kix/core/dist/model/';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

class TicketDescriptionWidgetComponent {

    private state: TicketDescriptionComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDescriptionComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.getFirstArticle();
        this.getTicketNotes();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.getFirstArticle();
        }
    }

    private async getFirstArticle(): Promise<void> {
        if (this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket && ticket.Articles && ticket.Articles.length) {
                this.state.firstArticle = ticket.Articles[0];
            }
        }
    }

    private getTicketNotes(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                const ticketNotesDF = ticket.DynamicFields.find(
                    (df) => df.ID === objectData.ticketNotesDFId
                );
                if (ticketNotesDF) {
                    this.state.ticketNotes = ticketNotesDF.DisplayValue;
                }
            }
        }
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
    }

    private maximize(): void {
        alert('Großansicht ...');
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }
}

module.exports = TicketDescriptionWidgetComponent;
