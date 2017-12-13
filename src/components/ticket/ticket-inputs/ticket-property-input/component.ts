import { TicketInputComponentMapper } from './TicketInputComponentMapper';

export class TicketPropertyInputComponent {

    private valueChanged(value: any): void {
        (this as any).emit('valueChanged', value);
    }

    private getInputComponent(property: string): any {
        return TicketInputComponentMapper.getInstance().getInputComponent(property);
    }
}

module.exports = TicketPropertyInputComponent;
