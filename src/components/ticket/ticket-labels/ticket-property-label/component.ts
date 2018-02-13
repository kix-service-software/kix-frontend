import { TicketLabelComponentMapper } from './TicketLabelComponentMapper';
import { TicketProperty } from '@kix/core/dist/model';
import { TicketPropertyLabelComponentState } from './TicketPropertyLabelComponentState';

export class TicketLabelComponent {

    private state: any;

    public onCreate(): void {
        this.state = new TicketPropertyLabelComponentState();
    }

    public onInput(input: any): void {
        this.state.ticket = input.ticket;
        this.state.property = input.property;

        if (this.state.ticket) {
            this.state.ticketId = this.state.ticket[TicketProperty.TICKET_ID];
            if (this.state.property) {
                this.state.value = this.state.ticket[this.state.property];
            }
        }

        this.state.hasLabel = typeof input.hasLabel !== 'undefined' ? input.hasLabel : true;
        this.state.hasText = typeof input.hasText !== 'undefined' ? input.hasText : true;
        this.state.hasIcon = typeof input.hasIcon !== 'undefined' ? input.hasIcon : true;
    }

    private getLabelComponent(property: string): any {
        return TicketLabelComponentMapper.getInstance().getLabelComponent(property);
    }

}

module.exports = TicketLabelComponent;
