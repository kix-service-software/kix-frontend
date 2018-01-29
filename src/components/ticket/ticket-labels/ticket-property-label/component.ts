import { TicketLabelComponentMapper } from './TicketLabelComponentMapper';
export class TicketLabelComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            showLabel: true
        };
    }

    public onInput(input: any): void {
        this.state.showLabel = input.showLabel !== undefined ? input.showLabel : true;
    }

    private getLabelComponent(property: string): any {
        return TicketLabelComponentMapper.getInstance().getLabelComponent(property);
    }

}

module.exports = TicketLabelComponent;
