import { TicketDescriptionComponentState } from './TicketDescriptionComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { TicketService } from '@kix/core/dist/browser/ticket';

class TicketDescriptionWIdgetComponent {

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
        this.getTicketDescription();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.getTicketDescription();
        }
    }

    private getTicketDescription(): void {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails && ticketDetails.articles && ticketDetails.articles.length) {
                const article = ticketDetails.articles[0];
                this.state.attachments = article.Attachments ? article.Attachments : [];
                this.state.description = article.Body;
            }
        }
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
    }
}

module.exports = TicketDescriptionWIdgetComponent;
