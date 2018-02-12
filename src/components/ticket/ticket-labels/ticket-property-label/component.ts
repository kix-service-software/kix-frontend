import { TicketLabelComponentMapper } from './TicketLabelComponentMapper';
import { TicketProperty } from '@kix/core/dist/model';
export class TicketLabelComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            hasLabel: true,
            hasText: true,
            hasIcon: true,
            ticket: null,
            ticketId: null,
            property: null,
            value: null
        };
    }

    public onInput(input: any): void {
        this.state.ticket = input.ticket;
        this.state.ticketId = this.state.ticket[TicketProperty.TICKET_ID];
        this.state.property = input.property;
        this.state.value = this.state.ticket[this.state.property];
        this.state.hasLabel = typeof input.hasLabel !== 'undefined' ? input.hasLabel : true;
        this.state.hasText = typeof input.hasText !== 'undefined' ? input.hasText : true;
        this.state.hasIcon = typeof input.hasIcon !== 'undefined' ? input.hasIcon : true;
    }

    private getLabelComponent(property: string): any {
        return TicketLabelComponentMapper.getInstance().getLabelComponent(property);
    }

}

module.exports = TicketLabelComponent;
