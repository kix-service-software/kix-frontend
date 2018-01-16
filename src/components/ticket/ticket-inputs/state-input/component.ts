import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class StateInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            states: [],
            stateId: null
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
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
        const ticketData = ContextService.getInstance().getObject(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            this.state.states = ticketData.states;
        }
    }

}

module.exports = StateInputComponent;
