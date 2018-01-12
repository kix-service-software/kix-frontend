import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';

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
        TicketService.getInstance().addStateListener('sla-input', this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.slaId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.slaId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData) {
            this.state.slas = ticketData.slas;
        }
    }

}

module.exports = ServiceInputComponent;
