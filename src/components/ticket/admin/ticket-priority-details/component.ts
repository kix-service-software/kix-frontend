import {
    AbstractMarkoComponent, ContextService, WidgetService, ActionFactory, IdService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    TicketPriorityDetailsContext, TicketPriorityDetailsContextConfiguration
} from '../../../../core/browser/ticket';
import { KIXObjectType, TicketPriority, WidgetType } from '../../../../core/model';
import { ComponentsService } from '../../../../core/browser/components';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: TicketPriorityDetailsContextConfiguration;

    private ticketPriority: TicketPriority;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketPriorityDetailsContext>(
            TicketPriorityDetailsContext.CONTEXT_ID
        );
        context.registerListener('ticket-priority-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (
                objectId: string, ticketPriority: TicketPriority, objectType: KIXObjectType, changedProperties: string[]
            ) => {
                if (objectType === KIXObjectType.TICKET_PRIORITY) {
                    this.initWidget(context, ticketPriority);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: TicketPriorityDetailsContext, priority?: TicketPriority): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.ticketPriority = priority ? priority : await context.getObject<TicketPriority>().catch((error) => null);

        if (!this.ticketPriority) {
            this.state.error = `Keine Priorität mit ID ${context.getObjectId()} verfügbar.`;
        } else {
            await this.prepareTitle();
        }

        this.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        this.state.contentWidgets = context.getContent(true);

        this.prepareActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    public async prepareTitle(): Promise<void> {
        this.state.title = this.ticketPriority.Name;
    }

    private prepareActions(): void {
        const config = this.configuration;
        if (config && this.ticketPriority) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                config.actions, this.ticketPriority
            );

            const generalActions = ActionFactory.getInstance().generateActions(
                config.generalActions, this.ticketPriority
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, generalActions);
        }
    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
