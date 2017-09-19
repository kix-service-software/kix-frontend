import { UserListConfiguration } from './model/UserListConfiguration';
import { ClientStorageHandler, LoadUsersRequest } from '@kix/core';
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
        this.state.configuration = input.configuration;
        if (this.store && this.state.configuration && !this.initialized) {
            this.initialized = true;
            this.loadUser();
            (this as any).emit('updateContentConfigurationHandler', this.updateContentConfigurationHandler.bind(this));
        }
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(USER_LIST_INITIALIZE(this.store));
    }

    public stateChanged(): void {
        const reduxState: UserListState = this.store.getState();

        if (reduxState.users) {
            this.state.users = reduxState.users;
            (this as any).emit('contentDataLoaded', this.state.users);
        }

        if (reduxState.error) {
            this.state.error = reduxState.error;
        }
    }

    private updateContentConfigurationHandler(configuration: UserListConfiguration) {
        this.state.configuration = configuration;
        this.loadUser();
    }

    private loadUser(): void {
        const reduxState: UserListState = this.store.getState();
        reduxState.socketListener.loadUsers(new LoadUsersRequest(
            ClientStorageHandler.getToken(),
            this.state.configuration.properties,
            this.state.configuration.limit)
        );
    }
}

module.exports = UserListWidgetComponent;
