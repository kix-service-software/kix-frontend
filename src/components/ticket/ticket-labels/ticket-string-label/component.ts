import { TicketUtil, TicketService, TicketNotification } from '@kix/core/dist/browser/ticket';
import { TicketProperty, TicketState } from '@kix/core/dist/model/';
import { ContextNotification, ContextService } from '@kix/core/dist/browser/context/';

export class TicketStringLabelComponent {

    private state: any;

    public onCreate(input: any) {
        this.state = {
            value: null,
            displayValue: null,
            ticketId: null,
            property: null,
            label: null
        };
    }

    public onInput(input: any): void {
        this.state.value = input.value;
        this.state.ticketId = Number(input.ticketId);
        this.state.property = input.property;
        this.setDisplayValue();
    }

    public onMount(): void {
        if (this.state.ticketId) {
            TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));
        }
        this.setDisplayValue();
    }

    private ticketServiceNotified(id: string, type: TicketNotification, ...args): void {
        if (id === this.state.ticketId && TicketNotification.TICKET_DETAILS_LOADED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        this.state.label = TicketUtil.getPropertyName(this.state.property);
        this.state.displayValue =
            TicketUtil.getPropertyValue(this.state.property, this.state.value, this.state.ticketId);
    }

}

module.exports = TicketStringLabelComponent;
