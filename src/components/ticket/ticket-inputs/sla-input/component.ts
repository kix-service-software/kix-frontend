import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class ServiceInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            slas: [],
            slaId: null,
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.slaId = Number(input.value);
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.slaId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.slaId);
    }

    private setStoreData(): void {
        const ticketData = ContextService.getInstance().getObject(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            this.state.slas = ticketData.slas;
        }
    }

}

module.exports = ServiceInputComponent;
