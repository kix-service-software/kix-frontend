import { TicketService, TicketData } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

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
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.priorityId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.priorityId);
    }

    private setStoreData(): void {
        const ticketData = ContextService.getInstance().getObject<TicketData>(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            this.state.priorities = ticketData.priorities;
        }
    }

}

module.exports = PriorityInputComponent;
