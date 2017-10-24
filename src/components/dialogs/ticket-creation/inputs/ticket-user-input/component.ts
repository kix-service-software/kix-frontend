import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { USER_ID_CHANGED, SEARCH_USER } from '../../store/actions';

declare var Rx: any;

class TicketUserInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            inputId: "user-input-" + Date.now(),
            value: null,
            users: [],
            search: false
        };
    }

    public onMount(): void {
        CreationTicketStore.INSTANCE.addStateListener(this.stateChanged.bind(this));

        const input = document.getElementsByName(this.state.inputId)[0];
        Rx.Observable.fromEvent(input, 'keydown')
            .throttleTime(250)
            .map((e) => e.target.value)
            .subscribe((value) => {
                CreationTicketStore.INSTANCE.getStore().dispatch(SEARCH_USER(value));
            });
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const processState = CreationTicketStore.INSTANCE.getProcessState();
        this.state.search = processState.userSearchInProgress;
        this.state.users = processState.user;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.INSTANCE.getStore().dispatch(USER_ID_CHANGED(event.target.value, 'owner'));
        this.state.value = event.target.value;
    }

}

module.exports = TicketUserInput;
