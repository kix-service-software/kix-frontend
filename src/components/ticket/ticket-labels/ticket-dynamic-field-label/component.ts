import { TicketData, TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketPriorityLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            fieldId: input.value,
            displayValue: null,
            label: null
        };
    }

    public onInput(input: any): void {
        this.state = {
            fieldId: input.value,
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
        const ticketData = ContextService.getInstance().getObject<TicketData>(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            const dynamicField = ticketData.ticketDfs.find((df) => df.ID === this.state.fieldId);
            if (dynamicField) {
                this.state.label = dynamicField.Label;

                const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
                if (ticketDetails && ticketDetails.ticket) {
                    const field = ticketDetails.ticket.DynamicFields.find((df) => df.ID === this.state.fieldId);
                    if (field) {
                        this.state.displayValue = field.DisplayValue;
                    }
                }
            }
        }
    }
}

module.exports = TicketPriorityLabelComponent;
