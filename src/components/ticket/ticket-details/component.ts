import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import {
    TicketService, TicketNotification, TicketLabelProvider, TicketDetailsContext
} from '@kix/core/dist/browser/ticket/';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import {
    TicketDetailsDashboardConfiguration, Ticket, Context, WidgetType, DashboardConfiguration
} from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context/';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';

export class TicketDetailsComponent {

    private state: TicketDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketId = Number(input.ticketId);
        this.loadTicket();
    }

    public onMount(): void {
        this.setBreadcrumbDetails();

        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));

        const contextURL = 'tickets/' + this.state.ticketId;
        const context = new TicketDetailsContext(this.state.ticketId);
        ContextService.getInstance().provideContext(context, true);

        this.loadTicket();
    }

    private loadTicket(): void {
        this.state.loading = true;
        TicketService.getInstance().loadTicket(this.state.ticketId).then(() => {
            this.setTicketHookInfo();
            this.state.loading = false;
        });
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED && id === TicketDetailsContext.CONTEXT_ID) {
            this.setConfiguration();
        }
    }

    private setConfiguration(): void {
        const context = ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        const config = (context.dashboardConfiguration as TicketDetailsDashboardConfiguration);

        if (config) {
            this.state.lanes = context ? context.getWidgets(WidgetType.LANE) : [];
            this.state.tabs = context ? context.getWidgets(WidgetType.LANE_TAB) : [];
            this.state.generalActions = config.generalActions;
            this.state.ticketActions = config.ticketActions;

            if (!this.state.activeTabId && this.state.tabs.length) {
                this.state.activeTabId = this.state.tabs[0].instanceId;
            }
        }
    }

    private setTicketHookInfo(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.ticketHook = objectData.ticketHook;
            this.state.ticketHookDivider = objectData.ticketHookDivider;
        }
    }

    public ticketServiceNotified(id: string, type: TicketNotification, ...args) {
        if (type === TicketNotification.TICKET_LOADED) {
            const ticket: Ticket = args[0];
            if (ticket.TicketID === this.state.ticketId) {
                this.state.ticket = ticket;
                this.setBreadcrumbDetails();
            }
        }
    }

    private setBreadcrumbDetails(): void {
        const value = this.state.ticket ? this.state.ticket.TicketNumber : this.state.ticketId;

        const breadcrumbDetails = new BreadcrumbDetails(
            'tickets', TicketDetailsContext.CONTEXT_ID, this.state.ticketId.toString(),
            'Ticket-Dashboard', '#' + value, null
        );

        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        return context ? context.getWidgetTemplate(instanceId) : undefined;
    }

    private tabClicked(tabId: string): void {
        this.state.activeTabId = tabId;
    }

    private getTitle(): string {
        const titlePrefix = this.state.ticketHook + this.state.ticketHookDivider + this.state.ticket.TicketNumber;
        return titlePrefix + " - " + this.state.ticket.Title;
    }

}

module.exports = TicketDetailsComponent;
