import { TicketStore, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/";
import { TYPE_ID_CHANGED } from '@kix/core/dist/model/client/';

class TicketTypeInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            typeId: null,
            ticketTypes: [],
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(TYPE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getInstance().getTicketCreationState();
        const processState = TicketStore.getInstance().getTicketDataState();

        this.state.typeId = Number(reduxState.typeId);
        this.state.ticketTypes = processState.types;
    }

}

module.exports = TicketTypeInput;
