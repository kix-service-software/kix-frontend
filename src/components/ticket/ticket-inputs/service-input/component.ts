import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class ServiceInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            services: [],
            serviceId: null,
        };
    }

    public onInput(input: any): void {
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
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.services = objectData.services;
        }
    }

}

module.exports = ServiceInputComponent;
