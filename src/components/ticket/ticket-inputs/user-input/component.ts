import { TicketService } from '@kix/core/dist/browser/ticket';
import { User } from '@kix/core/dist/model/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { IdService } from '@kix/core/dist/browser/IdService';

export class UserInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            users: [],
            userId: null,
            value: null,
            dataListId: IdService.generateDateBasedId('user-input-')
        };
    }

    public onInput(input: any): void {
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
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.users) {
            this.state.users = objectData.users;
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
