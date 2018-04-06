import {
    TicketService, TicketNotification, TicketDetailsContext, TicketDetailsContextConfiguration
} from '@kix/core/dist/browser/ticket/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import {
    BreadcrumbDetails, Ticket, Context, WidgetType
} from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context/';
import { ActionFactory } from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';
import { ComponentsService } from '@kix/core/dist/browser/components';

export class TicketDetailsComponent {

    private state: TicketDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState(Number(input.ticketId));
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
        TicketService.getInstance().loadTicket(this.state.ticketId);
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED
            || type === ContextNotification.CONTEXT_CHANGED
            && id === TicketDetailsContext.CONTEXT_ID
        ) {
            const context = ContextService.getInstance()
                .getContext<TicketDetailsContextConfiguration, TicketDetailsContext>(TicketDetailsContext.CONTEXT_ID);

            this.state.ticketDetailsConfiguration = context.contextConfiguration;
            if (this.state.ticketDetailsConfiguration) {
                this.state.loadingConfig = false;
                this.state.lanes = context.getLanes();
                this.state.tabWidgets = context.getLaneTabs();
                (this as any).update();
            }
        }
    }

    private ticketServiceNotified(id: number, type: TicketNotification, ...args): void {
        if (type === TicketNotification.TICKET_LOADED && id === this.state.ticketId) {
            this.state.loadingTicket = false;
            this.setBreadcrumbDetails();
            this.setTicketHookInfo();
        }
    }

    private getActions(): string[] {
        let actions = [];
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                actions = ActionFactory.getInstance().generateActions(config.generalActions, true, ticket);
            }
        }
        return actions;
    }

    private getTicketActions(): string[] {
        let actions = [];
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                actions = ActionFactory.getInstance().generateActions(config.ticketActions, true, ticket);
            }
        }
        return actions;
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
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getTitle(): string {
        const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
        const titlePrefix = this.state.ticketHook + this.state.ticketHookDivider + ticket.TicketNumber;
        return titlePrefix + " - " + ticket.Title;
    }

    private getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

}

module.exports = TicketDetailsComponent;
