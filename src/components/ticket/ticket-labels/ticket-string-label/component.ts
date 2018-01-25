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
            property: null
        };
    }

    public onInput(input: any): void {
        this.state.value = input.value;
        this.state.ticketId = Number(input.ticketId);
        this.state.property = input.property;
        this.setDisplayValue();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        if (this.state.ticketId) {
            TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));
        }
        this.setDisplayValue();
    }

    private contextNotified(id: string, type: ContextNotification, ...args) {
        if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.setDisplayValue();
        }
    }

    private ticketServiceNotified(id: string, type: TicketNotification, ...args): void {
        if (id === this.state.ticketId && TicketNotification.TICKET_DETAILS_LOADED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        this.state.displayValue =
            TicketUtil.getPropertyDisplayName(this.state.property, this.state.value, this.state.ticketId);
    }

}

module.exports = TicketStringLabelComponent;
