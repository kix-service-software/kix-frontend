import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { DynamicFieldsSettings } from './DynamicFieldsSettings';
import { DynamicFieldWidgetComponentState } from './DynamicFieldWidgetComponentState';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ActionFactory } from '@kix/core/dist/browser';

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
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();

        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration<DynamicFieldsSettings>(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(this.state.widgetConfiguration.actions);
        }

        this.state.configuredDynamicFields = this.state.widgetConfiguration.settings.dynamicFields;
        this.setDynamicFields();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.setDynamicFields();
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

    private getTemplate(componentId: string): any {
        return ClientStorageService.getComponentTemplate(componentId);
    }
}

module.exports = DynamicFieldWidgetComponent;
