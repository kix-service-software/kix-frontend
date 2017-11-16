import { ClientStorageHandler, LoadUsersRequest, WidgetBaseComponent } from '@kix/core/dist/model/client';

import { UserListComponentState } from './model/UserListComponentState';
import { UserListConfiguration } from './model/UserListConfiguration';
import { USER_LIST_INITIALIZE } from './store/actions';
import { UserListReduxState } from './store/UserListReduxState';
import { DashboardStore } from '../../../../../core/dist/model/client/dashboard/store/DashboardStore';
import { User } from '../../../../../core/dist/model/client/user/User';

class UserListWidgetComponent extends WidgetBaseComponent<UserListComponentState, UserListReduxState> {

    private componentInitialized: boolean = false;

    public onCreate(input: any): void {
        this.state = new UserListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        DashboardStore.addStateListener(this.stateChanged.bind(this));
        this.init();
    }

    public stateChanged(): void {
        super.stateChanged();

        // const users: User[] = UserStore.getUsers(this.state.instanceId);
        // if (users) {
        //     this.state.users = users;
        // }
    }

    public saveConfiguration(): void {
        DashboardStore.saveWidgetConfiguration(
            'user-list-widget', this.state.instanceId, this.state.widgetConfiguration
        );
    }

    protected showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    protected cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private init(): void {
        this.state.widgetConfiguration =
            DashboardStore.getWidgetConfiguration('user-list-widget', this.state.instanceId);

        if (!this.componentInitialized && this.state.widgetConfiguration) {
            this.componentInitialized = true;
            this.loadUser();
        }
    }

    private loadUser(): void {
        // UserStore.loadUser(this.state.instanceId);
    }
}

module.exports = UserListWidgetComponent;
