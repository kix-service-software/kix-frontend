import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { WidgetType, DashboardConfiguration } from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';

export class TicketDetailsComponent {

    private state: any;

    private static MODULE_ID: string = 'ticket-details';

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState();
    }

    public onInput(input: any): void {
        this.state = {
            ticketId: input.ticketId
        };

        TicketService.getInstance().loadTicketDetails(this.state.ticketId);
    }

    public onMount(): void {
        ClientStorageHandler.setContextId(TicketDetailsComponent.MODULE_ID);
        this.setBreadcrumbDetails();
        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        TicketService.getInstance().loadTicketDetails(this.state.ticketId);

        DashboardStore.getInstance().addStateListener(this.dashboardStateChanged.bind(this));
        DashboardStore.getInstance().loadDashboardConfiguration(TicketDetailsComponent.MODULE_ID);
    }

    private dashboardStateChanged(): void {
        const dashboardConfiguration: DashboardConfiguration =
            DashboardStore.getInstance().getDashboardConfiguration(TicketDetailsComponent.MODULE_ID);
        if (dashboardConfiguration && dashboardConfiguration.contextId === TicketDetailsComponent.MODULE_ID) {
            this.state.lanes = dashboardConfiguration.contentConfiguredWidgets
                .filter((ccw) => (ccw.configuration.type & WidgetType.LANE) === WidgetType.LANE);

            this.state.tabs = dashboardConfiguration.contentConfiguredWidgets
                .filter((ccw) => (ccw.configuration.type & WidgetType.LANE_TAB) === WidgetType.LANE_TAB);

            if (!this.state.activeTabId && this.state.tabs.length) {
                this.state.activeTabId = this.state.tabs[0].instanceId;
            }
        }
    }

    private ticketStateChanged(): void {
        const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
        if (ticketDetails) {
            this.state.ticket = ticketDetails.ticket;
            this.state.articles = ticketDetails.articles;
            this.setBreadcrumbDetails();
        }
    }

    private setBreadcrumbDetails(): void {
        const value = this.state.ticket ? this.state.ticket.TicketNumber : this.state.ticketId;

        const breadcrumbDetails = new BreadcrumbDetails(
            'tickets', TicketDetailsComponent.MODULE_ID, this.state.ticketId, 'Ticket-Dashboard', '#' + value, null
        );

        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    private getWidgetTemplate(instanceId: string): any {
        return DashboardStore.getInstance().getWidgetTemplate(instanceId, TicketDetailsComponent.MODULE_ID);
    }

    private tabClicked(tabId: string): void {
        this.state.activeTabId = tabId;
    }

}

module.exports = TicketDetailsComponent;
