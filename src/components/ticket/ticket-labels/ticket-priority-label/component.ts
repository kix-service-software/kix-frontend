import { TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketPriorityLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            priorityId: input.value,
            displayValue: null,
            label: null
        };
    }

    public onInput(input: any): void {
        this.state = {
            priorityId: input.value,
            ticketId: input.ticketId
        };
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        this.setDisplayValue();
    }

    private contextNotified(id: string, type: ContextNotification, ...args) {
        if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        this.state.label = TicketUtil.getPropertyName(TicketProperty.PRIORITY_ID);
        this.state.displayValue =
            TicketUtil.getPropertyValue(TicketProperty.PRIORITY_ID, this.state.priorityId, this.state.ticketId);
    }
}

module.exports = TicketPriorityLabelComponent;
