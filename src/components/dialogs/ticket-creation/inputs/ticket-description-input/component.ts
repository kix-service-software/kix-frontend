import { DESCRIPTION_CHANGED, TicketCreationReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

class TicketDescriptionInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            description: null
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(newValue: string): void {
        TicketStore.getStore().dispatch(DESCRIPTION_CHANGED(newValue));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getTicketCreationState();
        this.state.description = reduxState.description;
    }
}

module.exports = TicketDescriptionInput;
