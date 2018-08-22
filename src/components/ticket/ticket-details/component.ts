import { TicketDetailsContext } from '@kix/core/dist/browser/ticket/';
import { Ticket, WidgetType, KIXObjectType } from '@kix/core/dist/model';
import { ComponentState } from './ComponentState';
import { ContextService } from '@kix/core/dist/browser/context/';
import { ActionFactory, WidgetService } from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';
import { ComponentsService } from '@kix/core/dist/browser/components';

export class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as TicketDetailsContext);
        context.registerListener('ticket-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(context, ticket);
                }
            }
        });
        await this.initWidget(context);
    }

    private async initWidget(context: TicketDetailsContext, ticket?: Ticket): Promise<void> {
        this.state.loading = true;
        this.state.ticket = ticket ? ticket : await context.getObject<Ticket>();
        this.state.ticketDetailsConfiguration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        this.setActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
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
        const context = ContextService.getInstance().getActiveContext();
        return context.getDisplayText();
    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }
}

module.exports = Component;
