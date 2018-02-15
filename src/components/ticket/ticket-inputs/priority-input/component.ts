import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class PriorityInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            priorities: [],
            priorityId: null
        };
    }

    public onInput(input: any): void {
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
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.priorities = objectData.priorities;
        }
    }

}

module.exports = PriorityInputComponent;
