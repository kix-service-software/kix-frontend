import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';

export class PriorityInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            priorities: [],
            priorityId: null
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.priorityId = Number(input.value);
        TicketService.getInstance().addStateListener('priority-input', this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.priorityId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.priorityId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData) {
            this.state.priorities = ticketData.priorities;
        }
    }

}

module.exports = PriorityInputComponent;
