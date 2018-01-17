import { TicketService, TicketData } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class TypeInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            types: [],
            typeId: null
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.typeId = Number(input.value);
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.typeId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.typeId);
    }

    private setStoreData(): void {
        const ticketData = ContextService.getInstance().getObject<TicketData>(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            this.state.types = ticketData.types;
        }
    }

}

module.exports = TypeInputComponent;
