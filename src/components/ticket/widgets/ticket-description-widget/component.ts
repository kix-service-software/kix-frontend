import { TicketDescriptionComponentState } from './TicketDescriptionComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { TicketService, TicketData } from '@kix/core/dist/browser/ticket';
import { Attachment } from '@kix/core/dist/model/';

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
        } else if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.getTicketNotes();
        }
    }

    private async getFirstArticle(): Promise<void> {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails && ticketDetails.articles && ticketDetails.articles.length) {
                this.state.firstArticle = ticketDetails.articles[0];
                this.state.attachments = this.state.firstArticle.Attachments
                    ? this.state.firstArticle.Attachments.filter((a) => a.Disposition !== 'inline')
                    : [];
            }
        }
    }

    private getTicketNotes(): void {
        const ticketData = ContextService.getInstance().getObject<TicketData>(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails && ticketDetails.ticket) {
                const ticketNotesDF = ticketDetails.ticket.DynamicFields.find(
                    (df) => df.ID === ticketData.ticketNotesDFId
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
}

module.exports = TicketDescriptionWidgetComponent;
