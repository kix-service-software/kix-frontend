import {
    AbstractMarkoComponent, ContextService, WidgetService, ActionFactory, IdService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TicketTypeDetailsContext, TicketTypeDetailsContextConfiguration } from '../../../../core/browser/ticket';
import { KIXObjectType, TicketType, WidgetType } from '../../../../core/model';
import { ComponentsService } from '../../../../core/browser/components';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: TicketTypeDetailsContextConfiguration;

    private ticketType: TicketType;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketTypeDetailsContext>(
            TicketTypeDetailsContext.CONTEXT_ID
        );
        context.registerListener('ticket-type-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (
                objectId: string, ticketType: TicketType, objectType: KIXObjectType, changedProperties: string[]
            ) => {
                if (objectType === KIXObjectType.TICKET_TYPE) {
                    this.initWidget(context, ticketType);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: TicketTypeDetailsContext, ticketType?: TicketType): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.ticketType = ticketType ? ticketType : await context.getObject<TicketType>().catch((error) => null);

        if (!this.ticketType) {
            this.state.error = `Kein Tickettyp mit ID ${context.getObjectId()} verfügbar.`;
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
        this.state.title = this.ticketType.Name;
    }

    private prepareActions(): void {
        const config = this.configuration;
        if (config && this.ticketType) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                config.actions, this.ticketType
            );

            const generalActions = ActionFactory.getInstance().generateActions(
                config.generalActions, this.ticketType
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
