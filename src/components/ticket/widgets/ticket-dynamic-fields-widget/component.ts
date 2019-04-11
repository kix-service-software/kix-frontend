import { ActionFactory } from '../../../../core/browser';
import { ContextService } from '../../../../core/browser/context';

import { DynamicFieldsSettings } from './DynamicFieldsSettings';
import { ComponentState } from './ComponentState';
import { KIXObjectType, Ticket, ContextType } from '../../../../core/model';
import { TicketDetailsContext } from '../../../../core/browser/ticket';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration<DynamicFieldsSettings>(this.state.instanceId)
            : undefined;

        this.state.configuredDynamicFields = this.state.widgetConfiguration.settings.dynamicFields;

        context.registerListener('ticket-dynamic-fields-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            }
        });

        await this.initWidget(await context.getObject<Ticket>());

    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.ticket = ticket;
        this.prepareActions();
        this.setDynamicFields();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticket]
            );
        }
    }

    private setDynamicFields(): void {
        if (this.state.ticket) {
            this.state.dynamicFields = this.state.ticket.DynamicFields;
            this.state.filteredDynamicFields = [];
            this.state.configuredDynamicFields.forEach((dfId) => {
                const ticketDf = this.state.dynamicFields.find((df) => df.ID === dfId);
                if (ticketDf) {
                    this.state.filteredDynamicFields.push(ticketDf);
                }
            });
        }
    }
}

module.exports = Component;
