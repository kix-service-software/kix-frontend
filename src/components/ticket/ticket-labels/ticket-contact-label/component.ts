import { TicketData, TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketContactLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            customerUserId: input.value,
            ticketId: input.ticketId,
            displayValue: null,
            label: null,
            contact: null
        };
    }

    public onInput(input: any): void {
        this.state = {
            customerUserId: input.value,
            ticketId: Number(input.ticketId)
        };
        this.setDisplayValue();
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
        this.state.label = TicketUtil.getPropertyName(TicketProperty.CUSTOMER_USER_ID);
        this.state.displayValue = TicketUtil.getPropertyValue(
            TicketProperty.CUSTOMER_USER_ID, this.state.customerUserId, this.state.ticketId
        );

        if (this.state.ticketId) {
            const details = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (details) {
                this.state.contact = details.contact;
            }
        }
    }
}

module.exports = TicketContactLabelComponent;
