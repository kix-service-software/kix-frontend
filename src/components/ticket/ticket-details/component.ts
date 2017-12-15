import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';

export class TicketDetailsComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketId: input.ticketId,
            ticket: null,
            articles: []
        };
    }

    public onInput(input: any): void {
        this.state = {
            ticketId: input.ticketId
        };

        TicketStore.getInstance().loadTicketDetails(this.state.ticketId);
    }

    public onMount(): void {
        this.setBreadcrumbDetails();
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        TicketStore.getInstance().loadTicketDetails(this.state.ticketId);
    }

    private ticketStateChanged(): void {
        const ticketDetails = TicketStore.getInstance().getTicketDetails(this.state.ticketId);
        if (ticketDetails) {
            this.state.ticket = ticketDetails.ticket;
            this.state.articles = ticketDetails.articles;
            this.setBreadcrumbDetails();
        }
    }

    private setBreadcrumbDetails(): void {
        const contextId = ClientStorageHandler.getContextId();
        const value = this.state.ticket ? this.state.ticket.TicketNumber : this.state.ticketId;

        const breadcrumbDetails = new BreadcrumbDetails(
            contextId, 'ticket-details', this.state.ticketId, 'Ticket-Dashboard', '#' + value, null
        );

        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = TicketDetailsComponent;
