import { UserListConfiguration } from './model/UserListConfiguration';
import { ClientStorageHandler, LoadUsersRequest } from '@kix/core/dist/model/client';
import { UserListComponentState } from './model/UserListComponentState';
import { UserListState } from './store/UserListState';
import { USER_LIST_INITIALIZE } from './store/actions';

class UserListWidgetComponent {

    public state: UserListComponentState;

    private store: any;

    private initialized: boolean = false;

    public onCreate(input: any): void {
        this.state = new UserListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(USER_LIST_INITIALIZE(this.store, 'user-list-widget', this.state.instanceId));
    }

    public stateChanged(): void {
        const reduxState: UserListState = this.store.getState();

        if (reduxState.widgetConfiguration && !this.state.widgetConfiguration) {
            this.state.widgetConfiguration = reduxState.widgetConfiguration;
            this.loadUser();
        }

        if (reduxState.users) {
            this.state.users = reduxState.users;
        }

        if (reduxState.error) {
            this.state.error = reduxState.error;
        }
    }

    private loadUser(): void {
        const reduxState: UserListState = this.store.getState();
        reduxState.socketListener.loadUsers(new LoadUsersRequest(
            ClientStorageHandler.getToken(),
            this.state.widgetConfiguration.contentConfiguration.properties,
            this.state.widgetConfiguration.contentConfiguration.limit)
        );
    }
}

module.exports = UserListWidgetComponent;
