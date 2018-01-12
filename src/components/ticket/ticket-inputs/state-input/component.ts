import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';

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
        TicketService.getInstance().addStateListener('state-input', this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.stateId = event.target.value;
        (this as any).emit('valueChanged', this.state.stateId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData) {
            this.state.states = ticketData.states;
        }
    }

}

module.exports = StateInputComponent;
