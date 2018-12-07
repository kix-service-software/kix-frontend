import { AbstractMarkoComponent, ActionFactory, ContextService } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { TicketPriority, KIXObjectType } from '@kix/core/dist/model';
import { TicketPriorityLabelProvider, TicketPriorityDetailsContext } from '@kix/core/dist/browser/ticket';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketPriorityLabelProvider();
        const context = await ContextService.getInstance().getContext<TicketPriorityDetailsContext>(
            TicketPriorityDetailsContext.CONTEXT_ID
        );
        context.registerListener('ticket-priority-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectChanged: async (ticketId: string, ticketPriority: TicketPriority, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET_PRIORITY) {
                    this.initWidget(ticketPriority);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<TicketPriority>());
    }

    private async initWidget(ticketPriority: TicketPriority): Promise<void> {
        this.state.ticketPriority = ticketPriority;
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticketPriority) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticketPriority]
            );
        }
    }

}

module.exports = Component;
