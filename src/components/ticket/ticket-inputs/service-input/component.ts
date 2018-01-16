import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class ServiceInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            services: [],
            serviceId: null,
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.serviceId = Number(input.value);
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.serviceId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.serviceId);
    }

    private setStoreData(): void {
        const ticketData = ContextService.getInstance().getObject(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            this.state.services = ticketData.services;
        }
    }

}

module.exports = ServiceInputComponent;
