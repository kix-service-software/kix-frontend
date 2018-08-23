import { ActionFactory } from '@kix/core/dist/browser';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ContextService } from '@kix/core/dist/browser/context';
import { TicketService } from '@kix/core/dist/browser/ticket';

import { DynamicFieldsSettings } from './DynamicFieldsSettings';
import { DynamicFieldWidgetComponentState } from './DynamicFieldWidgetComponentState';
import { KIXObjectType, ContextMode, Ticket } from '@kix/core/dist/model';

class DynamicFieldWidgetComponent {

    private state: DynamicFieldWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new DynamicFieldWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration<DynamicFieldsSettings>(this.state.instanceId)
            : undefined;

        this.state.configuredDynamicFields = this.state.widgetConfiguration.settings.dynamicFields;

        context.registerListener('ticket-dynamic-fields-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
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
        this.setActions();
        this.setDynamicFields();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.ticket]
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

    private expandWidget(): void {
        alert('Großansicht ...');
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
    }

}

module.exports = DynamicFieldWidgetComponent;
