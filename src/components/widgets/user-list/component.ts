import { ClientStorageHandler, LoadUsersRequest, WidgetBaseComponent } from '@kix/core/dist/model/client';

import { UserListComponentState } from './model/UserListComponentState';

import { DashboardStore } from '@kix/core/dist/model/client/dashboard/store/DashboardStore';
import { UserStore } from '@kix/core/dist/model/client/user/store/UserStore';
import { User } from '@kix/core/dist/model/client/user/model/User';

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
        this.state.widgetConfiguration =
            DashboardStore.getWidgetConfiguration('user-list-widget', this.state.instanceId);

        if (!this.componentInitialized && this.state.widgetConfiguration) {
            this.componentInitialized = true;
            this.loadUser();
        }
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
        this.loadUser();
        this.cancelConfiguration();
    }

    protected showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    protected cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private loadUser(): void {
        const settings = this.state.widgetConfiguration.settings;
        UserStore.loadUser(this.state.instanceId, settings.properties, settings.limit);
    }
}

module.exports = UserListWidgetComponent;
