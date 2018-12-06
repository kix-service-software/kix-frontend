import { AbstractMarkoComponent, ActionFactory, ContextService } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { TicketType, KIXObjectType } from '@kix/core/dist/model';
import { TicketTypeLabelProvider, TicketTypeDetailsContext } from '@kix/core/dist/browser/ticket';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketTypeLabelProvider();
        const context = await ContextService.getInstance().getContext<TicketTypeDetailsContext>(
            TicketTypeDetailsContext.CONTEXT_ID
        );
        context.registerListener('ticket-type-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectChanged: async (ticketId: string, ticketType: TicketType, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET_TYPE) {
                    this.initWidget(ticketType);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<TicketType>());
    }

    private async initWidget(ticketType: TicketType): Promise<void> {
        this.state.ticketType = ticketType;
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticketType) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticketType]
            );
        }
    }

}

module.exports = Component;
