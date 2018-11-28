import {
    AbstractMarkoComponent, ContextService, ActionFactory, StandardTableFactoryService
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { TicketTypeDetailsContext } from '@kix/core/dist/browser/ticket';
import { TicketType, KIXObjectType } from '@kix/core/dist/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    private ticketType: TicketType;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketTypeDetailsContext>(
            TicketTypeDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
        }

        context.registerListener('ticket-type-assigned-textmodules-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (id: string, ticketType: TicketType, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET_TYPE) {
                    this.initWidget(ticketType);
                }
            }
        });

        await this.initWidget(await context.getObject<TicketType>());
    }

    private async initWidget(ticketType: TicketType): Promise<void> {
        this.ticketType = ticketType;
        this.setTable();
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.ticketType) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.ticketType]
            );
        }
    }

    private async setTable(): Promise<void> {
        const table = StandardTableFactoryService.getInstance().createStandardTable(KIXObjectType.TEXT_MODULE);
        table.layerConfiguration.contentLayer.setPreloadedObjects([]);
        await table.loadRows();
        this.state.table = table;
    }

}

module.exports = Component;
