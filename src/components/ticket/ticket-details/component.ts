import { TicketDetailsContext } from '@kix/core/dist/browser/ticket/';
import { Ticket, WidgetType, ContextType, KIXObjectType } from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService } from '@kix/core/dist/browser/context/';
import { ActionFactory, WidgetService, KIXObjectServiceRegistry } from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';
import { ComponentsService } from '@kix/core/dist/browser/components';

export class TicketDetailsComponent {

    private state: TicketDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as TicketDetailsContext);
        this.state.ticketId = Number(context.objectId);
        if (!this.state.ticketId) {
            this.state.error = 'No ticket id given.';
        } else {
            // TODO: mit den anderen Detail-Komponent (customer, contact) abgleichen
            ContextService.getInstance().registerListener({
                contextChanged: (contextId: string, ticketDeatilsContext: TicketDetailsContext, type: ContextType) => {
                    if (type === ContextType.MAIN && contextId === TicketDetailsContext.CONTEXT_ID) {
                        this.state.ticketDetailsConfiguration = ticketDeatilsContext.configuration;
                        this.state.loadingConfig = false;
                        this.state.lanes = ticketDeatilsContext.getLanes();
                        this.state.tabWidgets = ticketDeatilsContext.getLaneTabs();
                        (this as any).update();
                        this.setActions();
                    }
                }
            });
            await this.loadTicket();
            this.setActions();
        }
    }

    private async loadTicket(): Promise<void> {
        this.state.ticket = await ContextService.getInstance().getObject<Ticket>(
            KIXObjectType.TICKET, ContextType.MAIN
        ).catch((error) => {
            this.state.error = error;
        }) as Ticket;


        if (!this.state.ticket) {
            this.state.error = `No found ticket for ID: ${this.state.ticketId}`;
        }

        this.state.loadingTicket = false;
    }

    private setActions(): void {
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticket) {
            const actions = ActionFactory.getInstance().generateActions(
                config.generalActions, true, [this.state.ticket]
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);
        }
    }

    public getTicketActions(): string[] {
        let actions = [];
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticket) {
            actions = ActionFactory.getInstance().generateActions(config.ticketActions, true, [this.state.ticket]);
        }
        return actions;
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public getTitle(): string {
        // TODO: ggf. über Context?
        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(this.state.ticket.KIXObjectType);
        return service.getDetailsTitle(this.state.ticket);
    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }
}

module.exports = TicketDetailsComponent;
