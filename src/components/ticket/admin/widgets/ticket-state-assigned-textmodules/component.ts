import {
    AbstractMarkoComponent, ContextService, ActionFactory, StandardTableFactoryService
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { TicketStateDetailsContext } from '@kix/core/dist/browser/ticket';
import { TicketState, KIXObjectType } from '@kix/core/dist/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    private ticketState: TicketState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketStateDetailsContext>(
            TicketStateDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
        }

        context.registerListener('ticket-state-assigned-textmodules-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (id: string, ticketState: TicketState, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET_STATE) {
                    this.initWidget(ticketState);
                }
            }
        });

        await this.initWidget(await context.getObject<TicketState>());
    }

    private async initWidget(ticketState: TicketState): Promise<void> {
        this.ticketState = ticketState;
        this.setTable();
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.ticketState) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.ticketState]
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
