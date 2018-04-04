import {
    TicketService, TicketNotification, TicketDetailsContext
} from '@kix/core/dist/browser/ticket/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import {
    BreadcrumbDetails, TicketDetailsDashboardConfiguration, Ticket, Context, WidgetType, DashboardConfiguration
} from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context/';
import { ActionFactory } from '@kix/core/dist/browser';

export class TicketDetailsComponent {

    private state: TicketDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState();
    }

    public onInput(input: any): void {
        const newTicketId = Number(input.ticketId);
        if (newTicketId !== this.state.ticketId) {
            this.state.ticketId = newTicketId;
            this.loadTicket();
        }
    }

    public onMount(): void {
        this.setBreadcrumbDetails();

        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));

        const contextURL = 'tickets/' + this.state.ticketId;
        const context = new TicketDetailsContext(this.state.ticketId);
        ContextService.getInstance().provideContext(context, true);
    }

    private async loadTicket(): Promise<void> {
        if (!this.state.loading) {
            this.state.loading = true;
            await TicketService.getInstance().loadTicket(this.state.ticketId);
            this.setActions();
            this.setBreadcrumbDetails();
            this.setTicketHookInfo();
            this.state.loading = false;
        }
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED && id === TicketDetailsContext.CONTEXT_ID) {
            this.setConfiguration();
        }
    }

    private setConfiguration(): void {
        const context = ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        this.state.ticketDeatilsConfiguration = (context.dashboardConfiguration as TicketDetailsDashboardConfiguration);

        if (this.state.ticketDeatilsConfiguration) {
            this.state.lanes = context ? context.getWidgets(WidgetType.LANE) : [];
            this.state.tabWidgets = context ? context.getWidgets(WidgetType.LANE_TAB) : [];
            this.setActions();
        }
    }

    private setActions(): void {
        const config = this.state.ticketDeatilsConfiguration;
        if (config && this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                this.state.generalActions =
                    ActionFactory.getInstance().generateActions(config.generalActions, true, ticket);
                this.state.ticketActions =
                    ActionFactory.getInstance().generateActions(config.ticketActions, true, ticket);
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

    private setBreadcrumbDetails(): void {
        const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
        const value = ticket ? ticket.TicketNumber : this.state.ticketId;

        const breadcrumbDetails = new BreadcrumbDetails(
            'tickets', TicketDetailsContext.CONTEXT_ID, this.state.ticketId.toString(),
            'Ticket-Dashboard', '#' + value, null
        );

        ComponentRouterService.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        return context ? context.getWidgetTemplate(instanceId) : undefined;
    }

    private getTitle(): string {
        const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
        const titlePrefix = this.state.ticketHook + this.state.ticketHookDivider + ticket.TicketNumber;
        return titlePrefix + " - " + ticket.Title;
    }

}

module.exports = TicketDetailsComponent;
