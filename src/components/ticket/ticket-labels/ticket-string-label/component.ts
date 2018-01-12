import { TicketUtil, TicketService } from '@kix/core/dist/browser/ticket';
import { TicketProperty, TicketState } from '@kix/core/dist/model/';

export class TicketStringLabelComponent {

    private state: any;

    public onCreate(input: any) {
        this.state = {
            value: null,
            displayValue: null,
            ticketDataId: null,
            property: null
        };
    }

    public onInput(input: any): void {
        this.state.value = input.value;
        this.state.ticketDataId = input.ticketDataId;
        this.state.property = input.property;
        this.setDisplayValue();
    }

    public onMount(): void {
        TicketService.getInstance().addStateListener('ticket-string-label', this.ticketStateChanged.bind(this));
        this.setDisplayValue();
    }

    private ticketStateChanged(): void {
        this.setDisplayValue();
    }

    private setDisplayValue(): void {
        this.state.displayValue = TicketUtil.getPropertyDisplayName(this.state.property, this.state.value);
    }

}

module.exports = TicketStringLabelComponent;
