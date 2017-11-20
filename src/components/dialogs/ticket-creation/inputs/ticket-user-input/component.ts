import { USER_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/browser/ticket";
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from "../../model/ComponentId";

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
        TicketStore.addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        this.state.value = event.target.value;
        const user = this.state.users.find((u) => u.UserLogin === this.state.value);
        if (user) {
            TicketStore.getStore().dispatch(USER_ID_CHANGED(
                ComponentId.TICKET_CREATION_ID, user.UserID, this.state.type
            ));
            this.state.userInvalid = false;
        } else {
            this.state.userInvalid = true;
        }
    }

    private setStoreData(): void {
        const ticketData = TicketStore.getTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
        if (ticketData) {
            this.state.users = ticketData.users;
        }

        const creationData = TicketStore.getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData && this.state.type === 'owner' && creationData.ownerId && this.state.users.length) {
            this.state.value = this.getUserName(creationData.ownerId);
        }

        if (creationData && this.state.type === 'responsible' &&
            creationData.responsibleId && this.state.users.length) {
            this.state.value = this.getUserName(creationData.responsibleId);
        }
    }

    private getUserName(id: number): string {
        return this.state.users.find((u) => u.UserID === id).UserLogin;
    }

}

module.exports = TicketUserInput;
