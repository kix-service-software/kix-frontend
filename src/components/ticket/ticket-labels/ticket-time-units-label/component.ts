import { TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
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
        this.setDisplayValue();
    }

    private setDisplayValue(): void {
        this.state.label = TicketUtil.getPropertyName(TicketProperty.TIME_UNITS);
        this.state.displayValue = this.state.value + ' ' + TicketUtil.getTimeAccountUnit();
    }
}

module.exports = TicketStateLabelComponent;
