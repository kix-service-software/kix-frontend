import { TicketsComponentState } from './model/TicketsComponentState';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router/';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { Context, DashboardConfiguration } from '@kix/core/dist/model/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

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
        DashboardStore.getInstance().addStateListener(this.stateChanged.bind(this));
        DashboardStore.getInstance().loadDashboardConfiguration('tickets');

        ContextService.getInstance().provideContext(new Context('tickets'), 'tickets', true);

        const breadcrumbDetails =
            new BreadcrumbDetails('tickets', null, null, 'Ticket-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);

        if (this.state.ticketId) {
            ComponentRouterStore.getInstance().navigate(
                'base-router', 'ticket-details', { ticketId: this.state.ticketId }, true, this.state.ticketId
            );
        }
    }

    private stateChanged(id: string): void {
        const dashboardConfiguration: DashboardConfiguration = DashboardStore.getInstance().getDashboardConfiguration();
        if (id === 'tickets' && dashboardConfiguration) {
            this.state.rows = dashboardConfiguration.contentRows;

            const explorerList = [];
            for (const explorerId of dashboardConfiguration.explorerRows.map((r) => r[0])) {
                const explorer =
                    dashboardConfiguration.explorerConfiguredWidgets.find((e) => e.instanceId === explorerId);
                explorerList.push(explorer);
            }

            const context = new Context('tickets', new Map(), new Map(), explorerList);
            ContextService.getInstance().provideContext(context, 'tickets');
        }
    }
}

module.exports = TicketsComponent;
