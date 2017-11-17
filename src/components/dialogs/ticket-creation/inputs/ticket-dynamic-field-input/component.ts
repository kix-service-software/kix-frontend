import { DYNAMIC_FIELD_CHANGED } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';
import { ComponentId } from '../../model/ComponentId';
class TicketDynamicFieldInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            name: input.name,
            value: null
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore
            .getStore().dispatch(DYNAMIC_FIELD_CHANGED(
                ComponentId.TICKET_CREATION_ID, this.state.name, event.target.value
            ));
    }

    private setStoreData(): void {
        const creationData = TicketStore.getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            const dynamicField = creationData.dynamicFields.find((df) => df.Name === this.state.name);
            if (dynamicField) {
                this.state.value = dynamicField.Value;
            }
        }
    }

}

module.exports = TicketDynamicFieldInput;
