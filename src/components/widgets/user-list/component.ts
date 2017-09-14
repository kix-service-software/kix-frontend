import { LoadUsersRequest } from './../../../model/client/socket/users/LoadUsersRequest';
import { ClientStorageHandler } from '../../../model/client/ClientStorageHandler';
import { UserListComponentState } from './model/UserListComponentState';
import { UserListState } from './store/UserListState';
import { USER_LIST_INITIALIZE } from './store/actions';

class UserListWidgetComponent {

    public state: UserListComponentState;

    private store: any;

    public onCreate(input: any): void {
        this.state = new UserListComponentState();
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;
        if (this.store && this.state.configuration) {
            this.store.dispatch(USER_LIST_INITIALIZE(this.store)).then(() => {
                const reduxState: UserListState = this.store.getState();
                reduxState.socketListener.loadUsers(new LoadUsersRequest(
                    ClientStorageHandler.getToken(),
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
