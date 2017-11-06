import { DESCRIPTION_CHANGED } from '../../store/actions';
import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';

class TicketDescriptionInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            description: null
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(newValue: string): void {
        CreationTicketStore.getInstance().getStore().dispatch(DESCRIPTION_CHANGED(newValue));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        this.state.description = reduxState.description;
    }
}

module.exports = TicketDescriptionInput;
