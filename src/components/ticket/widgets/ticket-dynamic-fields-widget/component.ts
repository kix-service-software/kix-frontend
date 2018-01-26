import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

class TicketDescriptionWIdgetComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            ticketId: null,
            widgetConfiguration: null,
            dynamicFields: []
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setDynamicFields();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.setDynamicFields();
        }
    }

    private setDynamicFields(): void {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails && ticketDetails.ticket) {
                this.state.dynamicFields = ticketDetails.ticket.DynamicFields;
            }
        }
    }

    private expandWidget(): void {
        ApplicationStore.getInstance().toggleDialog(
            'ticket-dynamic-fields-container', { dynamicFields: this.state.dynamicFields }
        );
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
    }
}

module.exports = TicketDescriptionWIdgetComponent;
