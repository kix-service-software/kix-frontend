import { TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";
import { TicketData } from "@kix/core/dist/browser/ticket/TicketData";

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
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        this.setDisplayValue();
    }

    private contextNotified(id: string, type: ContextNotification, ...args) {
        if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        this.state.label = TicketUtil.getPropertyName(TicketProperty.AGE);
        this.state.displayValue = TicketUtil.calculateAge(this.state.age);
    }
}

module.exports = TicketAgeLabelComponent;
