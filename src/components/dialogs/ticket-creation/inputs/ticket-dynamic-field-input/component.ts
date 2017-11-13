import { TicketStore, TicketCreationReduxState } from "@kix/core/dist/model/client/";
import { DYNAMIC_FIELD_CHANGED } from '@kix/core/dist/model/client/';

class TicketDynamicFieldInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            name: input.name,
            value: null
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
        TicketStore.getInstance()
            .getStore().dispatch(DYNAMIC_FIELD_CHANGED(this.state.name, event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getInstance().getTicketCreationState();
        const dynamicField = reduxState.dynamicFields.find((df) => df.Name === this.state.name);
        if (dynamicField) {
            this.state.value = dynamicField.Value;
        }
    }

}

module.exports = TicketDynamicFieldInput;
