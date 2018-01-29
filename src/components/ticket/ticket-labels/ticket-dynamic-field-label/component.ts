import { TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketPriorityLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            fieldName: input.value,
            displayValue: null,
            label: null
        };
    }

    public onInput(input: any): void {
        this.state = {
            fieldName: input.value,
            ticketId: Number(input.ticketId)
        };
    }

    public onMount(): void {
        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        this.setDisplayValue();
    }

    private ticketServiceNotified(id: string, type: TicketNotification, ...args): void {
        if (id === this.state.ticketId && type === TicketNotification.TICKET_DETAILS_LOADED) {
            this.setDisplayValue();
        }
    }

    private contextNotified(id: string, type: ContextNotification, ...args) {
        if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        this.state.label = this.state.fieldName;
        const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
        if (ticketDetails && ticketDetails.ticket) {
            const field = ticketDetails.ticket.DynamicFields.find((df) => df.Name === this.state.fieldName);
            if (field) {
                this.state.displayValue = field.Value;
            }
        }
    }
}

module.exports = TicketPriorityLabelComponent;
