import { UserListConfiguration } from './model/UserListConfiguration';
import { ClientStorageHandler, LoadUsersRequest, WidgetBaseComponent } from '@kix/core/dist/model/client';
import { UserListComponentState } from './model/UserListComponentState';
import { UserListReduxState } from './store/UserListReduxState';
import { USER_LIST_INITIALIZE } from './store/actions';

class UserListWidgetComponent extends WidgetBaseComponent<UserListComponentState, UserListReduxState> {

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
        super.stateChanged();

        const reduxState: UserListReduxState = this.store.getState();

        if (this.state.widgetConfiguration) {
            this.loadUser();
        }

        if (reduxState.users) {
            this.state.users = reduxState.users;
        }
    }

    public saveConfiguration(): void {
        const reduxState: UserListReduxState = this.store.getState();
        reduxState.socketListener.saveWidgetContentConfiguration(this.state.widgetConfiguration);
        (this as any).setStateDirty("widgetConfiguration");
        this.cancelConfiguration();
    }

    protected showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    protected cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private loadUser(): void {
        if (this.state.widgetConfiguration) {
            const reduxState: UserListReduxState = this.store.getState();
            reduxState.socketListener.loadUsers(new LoadUsersRequest(
                ClientStorageHandler.getToken(),
                this.state.widgetConfiguration.contentConfiguration.properties,
                this.state.widgetConfiguration.contentConfiguration.limit)
            );
        }
    }
}

module.exports = UserListWidgetComponent;
