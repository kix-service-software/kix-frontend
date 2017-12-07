import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';

export class TicketDetailsComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketId: input.ticketId
        };
    }

    public onInput(input: any): void {
        this.state = {
            ticketId: input.ticketId
        };
    }

    public onMount(): void {
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails = new BreadcrumbDetails(
            contextId, 'ticket-details', this.state.ticketId, 'Ticket-Dashboard', '#' + this.state.ticketId, null
        );

        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = TicketDetailsComponent;
