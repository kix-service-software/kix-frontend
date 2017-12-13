import { TicketsComponentState } from './model/TicketsComponentState';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router/';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

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
        DashboardStore.getInstance().loadDashboardConfiguration();
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'Ticket-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);

        if (this.state.ticketId) {
            ComponentRouterStore.getInstance().navigate(
                'base-router', 'ticket-details', { ticketId: this.state.ticketId }, true, this.state.ticketId
            );
        }
    }
}

module.exports = TicketsComponent;
