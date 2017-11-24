import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';

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
        TicketStore.getInstance().addStateListener(this.ticketDataStateChanged.bind(this));
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
        const ticketData = TicketStore.getInstance().getTicketData(this.state.ticketDataId);
        if (ticketData) {
            this.state.queues = ticketData.queues;
        }
    }

}

module.exports = QueueInputComponent;
