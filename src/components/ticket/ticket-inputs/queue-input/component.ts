import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';

export class QueueInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            queues: [],
            queueId: null,
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.queueId = Number(input.value);
        TicketService.getInstance().addStateListener('queue-input', this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.queueId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.queueId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData) {
            this.state.queues = ticketData.queues;
        }
    }

}

module.exports = QueueInputComponent;
