import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { DYNAMIC_FIELD_CHANGED } from '../../store/actions';

class TicketDynamicFieldInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            name: input.name,
            value: null
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance()
            .getStore().dispatch(DYNAMIC_FIELD_CHANGED(this.state.name, event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        const dynamicField = reduxState.dynamicFields.find((df) => df.Name === this.state.name);
        if (dynamicField) {
            this.state.value = dynamicField.Value;
        }
    }

}

module.exports = TicketDynamicFieldInput;
