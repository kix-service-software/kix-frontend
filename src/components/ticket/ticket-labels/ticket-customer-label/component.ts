import { TicketData, TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketCustomerLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            cutsomerId: input.value,
            ticketId: input.ticketId,
            displayValue: null,
            label: null,
            customer: null
        };
    }

    public onInput(input: any): void {
        this.state = {
            cutsomerId: input.value,
            ticketId: Number(input.ticketId)
        };
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));
        this.setDisplayValue();
    }

    private contextNotified(id: string, type: ContextNotification, ...args) {
        if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.setDisplayValue();
        }
    }

    private ticketServiceNotified(id: string, type: TicketNotification, ...args): void {
        if (id === this.state.ticketId && type === TicketNotification.TICKET_DETAILS_LOADED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        this.state.label = TicketUtil.getPropertyName(TicketProperty.CUSTOMER_ID);
        this.state.displayValue =
            TicketUtil.getPropertyValue(TicketProperty.CUSTOMER_ID, this.state.cutsomerId, this.state.ticketId);

        if (this.state.ticketId) {
            const details = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (details) {
                this.state.customer = details.customer;
            }
        }
    }
}

module.exports = TicketCustomerLabelComponent;
