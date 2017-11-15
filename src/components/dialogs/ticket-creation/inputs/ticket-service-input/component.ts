import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { SERVICE_ID_CHANGED } from '../../store/actions';
import { TicketCreationProcessReduxState } from '../../store/TicketCreationProcessReduxState';

class TicketServiceInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            serviceId: null,
            services: []
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(SERVICE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        const processState: TicketCreationProcessReduxState = CreationTicketStore.getInstance().getProcessState();

        this.state.serviceId = reduxState.serviceId;
        this.state.services = processState.services;
    }

}

module.exports = TicketServiceInput;
