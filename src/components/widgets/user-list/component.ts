import { ClientStorageHandler, LoadUsersRequest, WidgetBaseComponent } from '@kix/core/dist/model/client';

import { UserListComponentState } from './model/UserListComponentState';
import { UserListConfiguration } from './model/UserListConfiguration';

import { DashboardStore } from '@kix/core/dist/model/client/dashboard/store/DashboardStore';
import { UserStore } from '@kix/core/dist/model/client/user/store/UserStore';
import { User } from '../../../../../core/dist/model/client/user/model/User';

class UserListWidgetComponent {

    private componentInitialized: boolean = false;

    private state: UserListComponentState;

    public onCreate(input: any): void {
        this.state = new UserListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        UserStore.addStateListener(this.userStateChanged.bind(this));
        this.init();
    }

    public userStateChanged(): void {
        const users: User[] = UserStore.getUsers(this.state.instanceId);
        if (users) {
            this.state.users = users;
        }
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
        const settings = this.state.widgetConfiguration.contentConfiguration;
        UserStore.loadUser(this.state.instanceId, settings.properties, settings.limit);
    }
}

module.exports = UserListWidgetComponent;
