import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';

export class TypeInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            types: [],
            typeId: null
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.typeId = Number(input.value);
        TicketService.getInstance().addStateListener(this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.typeId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.typeId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData) {
            this.state.types = ticketData.types;
        }
    }

}

module.exports = TypeInputComponent;
