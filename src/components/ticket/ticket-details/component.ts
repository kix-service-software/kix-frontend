import {
    TicketService, TicketDetailsContext, TicketDetailsContextConfiguration
} from '@kix/core/dist/browser/ticket/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import {
    BreadcrumbDetails, Ticket, Context, WidgetType, ContextType, KIXObjectType
} from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService } from '@kix/core/dist/browser/context/';
import { ActionFactory } from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';
import { ComponentsService } from '@kix/core/dist/browser/components';

export class TicketDetailsComponent {

    private state: TicketDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState(Number(input.ticketId));
    }

    public async onMount(): Promise<void> {
        this.setBreadcrumbDetails();

        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, ticketDeatilsContext: TicketDetailsContext, type: ContextType) => {
                if (type === ContextType.MAIN && contextId === TicketDetailsContext.CONTEXT_ID) {
                    this.state.ticketDetailsConfiguration = ticketDeatilsContext.configuration;
                    this.state.loadingConfig = false;
                    this.state.lanes = ticketDeatilsContext.getLanes();
                    this.state.tabWidgets = ticketDeatilsContext.getLaneTabs();
                    (this as any).update();
                }
            }
        });

        const contextURL = 'tickets/' + this.state.ticketId;
        const context = new TicketDetailsContext(this.state.ticketId);
        await ContextService.getInstance().provideContext(context, true, ContextType.MAIN);
        this.loadTicket();
    }

    private async loadTicket(): Promise<void> {
        const ticket = await TicketService.getInstance().loadTicket(this.state.ticketId);
        this.state.loadingTicket = false;
        this.setBreadcrumbDetails();
        this.setTicketHookInfo();
        const context = ContextService.getInstance().getContext(null, TicketDetailsContext.CONTEXT_ID);
        context.provideObject(ticket.TicketID, ticket, KIXObjectType.TICKET);
        context.provideObject(ticket.contact.ContactID, ticket.contact, KIXObjectType.CONTACT);
        context.provideObject(ticket.customer.CustomerID, ticket.customer, KIXObjectType.CUSTOMER);
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

    private getLaneWidgetType(): number {
        return WidgetType.LANE;
    }
}

module.exports = TicketDetailsComponent;
