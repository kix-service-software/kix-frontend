import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { CUSTOMER_ID_CHANGED } from '@kix/core/dist/browser/ticket';
import { ComponentId } from '../../model/ComponentId';

class TicketCustomerIdInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            customerId: null
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(
            CUSTOMER_ID_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value)
        );
    }

    private setStoreData(): void {
        const creationData = TicketStore.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.customerId = creationData.customerId;
        }
    }

}

module.exports = TicketCustomerIdInput;
