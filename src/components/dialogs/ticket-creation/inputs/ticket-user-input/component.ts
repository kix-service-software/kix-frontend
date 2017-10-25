import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { USER_ID_CHANGED, SEARCH_USER } from '../../store/actions';

declare var Rx: any;

class TicketUserInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            type: input.type ? input.type : 'owner',
            inputId: "user-input-" + Date.now(),
            value: null,
            users: [],
            userSearched: false,
            userSearchInProgress: false,
            userInvalid: false
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const processState = CreationTicketStore.getInstance().getProcessState();

        if (processState.initialized && !this.state.userSearched) {
            this.state.userSearched = true;
            CreationTicketStore.getInstance().getStore().dispatch(SEARCH_USER(""));
        }

        this.state.userSearchInProgress = processState.userSearchInProgress;
        this.state.users = processState.user;
    }

    public valueChanged(event: any): void {
        this.state.value = event.target.value;
        const user = this.state.users.find((u) => u.UserLogin === this.state.value);
        if (user) {
            CreationTicketStore.getInstance().getStore().dispatch(USER_ID_CHANGED(user.UserID, this.state.type));
            this.state.userInvalid = false;
        } else {
            this.state.userInvalid = true;
        }
    }

}

module.exports = TicketUserInput;
