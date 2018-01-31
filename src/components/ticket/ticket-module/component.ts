import { TicketsComponentState } from './model/TicketsComponentState';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router/';
import { Context, DashboardConfiguration } from '@kix/core/dist/model/';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';

class TicketsComponent {

    public state: TicketsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketsComponentState();
    }

    public onInput(input: any) {
        this.state.ticketId = input.objectId;
    }

    public onMount(): void {
        if (this.state.ticketId) {
            ComponentRouterStore.getInstance().navigate(
                'base-router', 'ticket-details', { ticketId: this.state.ticketId }, this.state.ticketId
            );
        } else {
            ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
            ContextService.getInstance().provideContext(
                new Context(TicketsComponentState.MODULE_ID, 'tickets'), TicketsComponentState.MODULE_ID, true
            );

            DashboardService.getInstance().loadDashboardConfiguration(TicketsComponentState.MODULE_ID);

            const breadcrumbDetails =
                new BreadcrumbDetails(TicketsComponentState.MODULE_ID, null, null, 'Ticket-Dashboard');
            ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
        }
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (id === TicketsComponentState.MODULE_ID && type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED) {
            const dashboardConfiguration: DashboardConfiguration = args[0];
            this.state.rows = dashboardConfiguration ? dashboardConfiguration.contentRows : [];
        }
    }
}

module.exports = TicketsComponent;
