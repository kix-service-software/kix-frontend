import { TicketData, TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketStateLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            pendingTime: input.value,
            displayValue: null,
            label: null,
            ticketId: null,
            isPendingReached: false
        };
    }

    public onInput(input: any): void {
        this.state = {
            pendingTime: input.value,
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
        this.state.label = TicketUtil.getPropertyLabelName(TicketProperty.PENDING_TIME);
        this.state.displayValue = TicketUtil.getDateTimeString(this.state.pendingTime);
        this.state.isPendingReached = TicketUtil.isPendingReached(this.state.pendingTime);
    }
}

module.exports = TicketStateLabelComponent;
