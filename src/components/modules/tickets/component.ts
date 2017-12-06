import { TicketsComponentState } from './model/TicketsComponentState';
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router/';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

class TicketsComponent {

    public state: TicketsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new TicketsComponentState();
    }

    public onInput(input: any) {
        this.state.ticketId = input.objectId;
    }

    public onMount(): void {
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'Ticket-Dashboard', null, null);
        KIXRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);

        if (this.state.ticketId) {
            KIXRouterStore.getInstance().navigate(
                'base-router', 'ticket-details', { ticketId: this.state.ticketId }, true, this.state.ticketId
            );
        }
    }
}

module.exports = TicketsComponent;
