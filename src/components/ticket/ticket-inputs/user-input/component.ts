import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { User } from '@kix/core/dist/model/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class UserInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            users: [],
            userId: null,
            value: null,
            dataListId: 'user-input-' + Date.now()
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.userId = Number(input.value);
    }

    public onMount(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        this.state.value = event.target.value;
        const user: User = this.state.users.find((u) => u.UserLogin === this.state.value);
        if (user) {
            this.state.userId = user.UserID;
            (this as any).emit('valueChanged', this.state.userId);
        }
    }

    private setStoreData(): void {
        const ticketData = ContextService.getInstance().getObject(TicketService.TICKET_DATA_ID);
        if (ticketData && ticketData.users) {
            this.state.users = ticketData.users;
            if (this.state.userId) {
                const user = this.state.users.find((u) => u.UserID === this.state.userId);
                if (user) {
                    this.state.value = user.UserLogin;
                }
            }
        }
    }

}

module.exports = UserInputComponent;
