import { TicketDescriptionComponentState } from './TicketDescriptionComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { Attachment } from '@kix/core/dist/model/';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ActionFactory } from '@kix/core/dist/browser';

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
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(this.state.widgetConfiguration.actions);
        }

        this.getFirstArticle();
        this.getTicketNotes();
    }

    private async getFirstArticle(): Promise<void> {
        if (this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket && ticket.Articles && ticket.Articles.length) {
                const articles = new Array(...ticket.Articles);
                articles.sort((a, b) => a.IncomingTime - b.IncomingTime);
                this.state.firstArticle = articles[0];
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
}

module.exports = TicketDescriptionWidgetComponent;
