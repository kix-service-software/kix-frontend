import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class QueueInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            queues: [],
            queueId: null,
        };
    }

    public onInput(input: any): void {
        this.state.queueId = Number(input.value);
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.queueId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.queueId);
    }

    private setStoreData(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.queues = objectData.queues;
        }
    }

}

module.exports = QueueInputComponent;
