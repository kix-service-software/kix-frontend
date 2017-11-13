import { TicketStore, TicketCreationReduxState } from "@kix/core/dist/model/client/";
import { DESCRIPTION_CHANGED } from '@kix/core/dist/model/client/';

class TicketDescriptionInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            description: null
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(newValue: string): void {
        TicketStore.getInstance().getStore().dispatch(DESCRIPTION_CHANGED(newValue));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getInstance().getTicketCreationState();
        this.state.description = reduxState.description;
    }
}

module.exports = TicketDescriptionInput;
