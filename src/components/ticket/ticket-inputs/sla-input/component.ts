import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class SLAInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            slas: [],
            slaId: null,
        };
    }

    public onInput(input: any): void {
        this.state.slaId = Number(input.value);
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.slaId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.slaId);
    }

    private setStoreData(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.slas = objectData.slas;
        }
    }

}

module.exports = SLAInputComponent;
