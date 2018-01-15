import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { TicketData, TicketService } from '@kix/core/dist/browser/ticket/';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketDetails, Ticket, Context, WidgetType, DashboardConfiguration } from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { AbstractServiceListener } from '@kix/core/dist/browser/AbstractServiceListener';

export class TicketDetailsComponent extends AbstractServiceListener {

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
        this.setBreadcrumbDetails();

        TicketService.getInstance().addStateListener(this);

        TicketService.getInstance().loadTicketDetails(this.state.ticketId);

        DashboardStore.getInstance().addStateListener(this.dashboardStateChanged.bind(this));
        DashboardStore.getInstance().loadDashboardConfiguration(TicketDetailsComponent.MODULE_ID);
    }

    private dashboardStateChanged(id: string): void {
        const dashboardConfiguration: DashboardConfiguration =
            DashboardStore.getInstance().getDashboardConfiguration(TicketDetailsComponent.MODULE_ID);

        if (id === TicketDetailsComponent.MODULE_ID &&
            dashboardConfiguration &&
            dashboardConfiguration.contextId === TicketDetailsComponent.MODULE_ID) {

            const context = new Context('ticket-details', dashboardConfiguration, new Map(), new Map(), );
            ContextService.getInstance().provideContext(context);

            this.state.lanes = context.getWidgets(WidgetType.LANE);
            this.state.tabs = context.getWidgets(WidgetType.LANE_TAB);

            if (!this.state.activeTabId && this.state.tabs.length) {
                this.state.activeTabId = this.state.tabs[0].instanceId;
            }
        }
    }

    public ticketDetailsLoaded(ticketId: any, ticketDetails: TicketDetails) {
        if (ticketDetails.ticketId === this.state.ticketId && ticketDetails) {
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
        const context = ContextService.getInstance().getActiveContext();
        return context ? context.getWidgetTemplate(instanceId) : undefined;
    }

    private tabClicked(tabId: string): void {
        this.state.activeTabId = tabId;
    }

}

module.exports = TicketDetailsComponent;
