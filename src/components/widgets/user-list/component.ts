import { LoadUsersRequest } from './../../../model/client/socket/users/LoadUsersRequest';
import { LocalStorageHandler } from '../../../model/client/TokenHandler';
import { UserListComponentState } from './model/UserListComponentState';
import { UserListState } from './store/UserListState';
import { USER_LIST_INITIALIZE } from './store/actions';

class UserListWidgetComponent {

    public state: UserListComponentState;

    private store: any;

    private frontendSocketUrl: string;

    public onCreate(input: any): void {
        this.state = new UserListComponentState();
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;
        if (this.state.configuration) {
            this.store.dispatch(USER_LIST_INITIALIZE(this.frontendSocketUrl, this.store)).then(() => {
                const reduxState: UserListState = this.store.getState();
                reduxState.socketlListener.loadUsers(new LoadUsersRequest(
                    LocalStorageHandler.getToken(),
                    this.state.configuration.properties,
                    this.state.configuration.limit)
                );
            });
        }
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        const reduxState: UserListState = this.store.getState();

        if (reduxState.users) {
            this.state.users = reduxState.users;
        }

        if (reduxState.error) {
            this.state.error = reduxState.error;
        }
    }
}

module.exports = UserListWidgetComponent;
