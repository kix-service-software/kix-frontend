import { TicketsComponentState } from './../../../../modules/tickets/model/TicketsComponentState';
import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { USER_ID_CHANGED } from '../../store/actions';

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
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
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

    private setStoreData(): void {
        const processState = CreationTicketStore.getInstance().getProcessState();
        const ticketState = CreationTicketStore.getInstance().getTicketState();

        this.state.users = processState.users;

        if (this.state.type === 'owner' && ticketState.ownerId && this.state.users.length) {
            this.state.value = this.getUserName(ticketState.ownerId);
        }

        if (this.state.type === 'responsible' && ticketState.responsibleId && this.state.users.length) {
            this.state.value = this.getUserName(ticketState.responsibleId);
        }
    }

    private getUserName(id: number): string {
        return this.state.users.find((u) => u.UserID === id).UserLogin;
    }

}

module.exports = TicketUserInput;
