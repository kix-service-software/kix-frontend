import { ActionFactory } from '@kix/core/dist/browser';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ContextService } from '@kix/core/dist/browser/context';
import { TicketService } from '@kix/core/dist/browser/ticket';

import { DynamicFieldsSettings } from './DynamicFieldsSettings';
import { DynamicFieldWidgetComponentState } from './DynamicFieldWidgetComponentState';

class DynamicFieldWidgetComponent {

    private state: DynamicFieldWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new DynamicFieldWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        context.registerListener({
            objectChanged: () => (objectId: string | number, object: any) => {
                if (objectId === this.state.ticketId) {
                    this.setDynamicFields();
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; }
        });

        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration<DynamicFieldsSettings>(this.state.instanceId)
            : undefined;

        this.setActions();

        this.state.configuredDynamicFields = this.state.widgetConfiguration.settings.dynamicFields;
        this.setDynamicFields();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                this.state.actions = ActionFactory.getInstance().generateActions(
                    this.state.widgetConfiguration.actions, false, ticket
                );
            }
        }
    }

    private setDynamicFields(): void {
        if (this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                this.state.dynamicFields = ticket.DynamicFields;
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

    private expandWidget(): void {
        // ApplicationService.getInstance().toggleMainDialog(
        //     'ticket-dynamic-fields-container', {
        //         dynamicFields: this.state.dynamicFields,
        //         ticketId: this.state.ticketId
        //     }
        // );
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
