import { TicketData, TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketStateLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            value: input.value,
            displayValue: null,
            label: null,
            ticketId: null
        };
    }

    public onInput(input: any): void {
        this.state = {
            value: input.value,
            ticketId: Number(input.ticketId)
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
        this.state.label = TicketUtil.getPropertyLabelName(TicketProperty.TIME_UNITS);
        this.state.displayValue = this.state.value + ' ' + TicketUtil.getTimeAccountUnit();
    }
}

module.exports = TicketStateLabelComponent;
