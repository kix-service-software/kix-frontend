import { AbstractMarkoComponent, ActionFactory, ContextService } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TicketState, KIXObjectType } from '../../../../../core/model';
import { TicketStateLabelProvider, TicketStateDetailsContext } from '../../../../../core/browser/ticket';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketStateLabelProvider();
        const context = await ContextService.getInstance().getContext<TicketStateDetailsContext>(
            TicketStateDetailsContext.CONTEXT_ID
        );
        context.registerListener('ticket-state-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, ticketState: TicketState, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET_STATE) {
                    this.initWidget(ticketState);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<TicketState>());
    }

    private async initWidget(ticketState: TicketState): Promise<void> {
        this.state.ticketState = ticketState;
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticketState) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticketState]
            );
        }
    }

}

module.exports = Component;
