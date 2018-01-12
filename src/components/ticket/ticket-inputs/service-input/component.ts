import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';

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
        // TicketService.getInstance().addStateListener('service-input', this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.serviceId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.serviceId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData) {
            this.state.services = ticketData.services;
        }
    }

}

module.exports = ServiceInputComponent;
