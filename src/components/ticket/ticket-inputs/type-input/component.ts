import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class TypeInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            types: [],
            typeId: null
        };
    }

    public onInput(input: any): void {
        this.state.typeId = Number(input.value);
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.typeId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.typeId);
    }

    private setStoreData(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.types = objectData.types;
        }
    }

}

module.exports = TypeInputComponent;
