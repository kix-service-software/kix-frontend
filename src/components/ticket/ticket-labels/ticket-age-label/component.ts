import { TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketAgeLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            age: input.value,
            displayValue: null,
            label: null,
            pending: false
        };
    }

    public onInput(input: any): void {
        this.state = {
            age: input.value,
        };
    }

    public onMount(): void {
        this.setDisplayValue();
    }

    private setDisplayValue(): void {
        this.state.label = TicketUtil.getPropertyName(TicketProperty.AGE);
        this.state.displayValue = TicketUtil.calculateAge(this.state.age);
    }
}

module.exports = TicketAgeLabelComponent;
