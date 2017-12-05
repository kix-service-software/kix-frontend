import { TicketLabelComponentMapper } from './TicketLabelComponentMapper';
export class TicketLabelComponent {

    private getLabelComponent(property: string): any {
        return TicketLabelComponentMapper.getInstance().getLabelComponent(property);
    }

}

module.exports = TicketLabelComponent;
