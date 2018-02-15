import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class StateInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            states: [],
            stateId: null
        };
    }

    public onInput(input: any): void {
        this.state.stateId = input.value;
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.stateId = event.target.value;
        (this as any).emit('valueChanged', this.state.stateId);
    }

    private setStoreData(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.states = objectData.states;
        }
    }

}

module.exports = StateInputComponent;
