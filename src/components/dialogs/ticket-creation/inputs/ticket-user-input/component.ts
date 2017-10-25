import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { USER_ID_CHANGED } from '../../store/actions';

declare var Rx: any;

class TicketUserInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            type: input.type ? input.type : 'owner',
            inputId: "user-input-" + Date.now(),
            value: null,
            users: [],
            userInvalid: false
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        const processState: TicketCreationProcessReduxState = CreationTicketStore.getInstance().getProcessState();
        this.state.users = processState.users;
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
