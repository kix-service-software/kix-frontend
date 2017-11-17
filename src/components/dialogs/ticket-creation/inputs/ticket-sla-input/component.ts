import { SLA_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

class TicketSLAInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            slaId: null
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getStore().dispatch(SLA_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getTicketCreationState();
        this.state.slaId = reduxState.slaId;
    }

}

module.exports = TicketSLAInput;
