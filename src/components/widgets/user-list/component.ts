import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

import { UserListComponentState } from './model/UserListComponentState';
import { UserListConfiguration } from './model/UserListConfiguration';

import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { UserStore } from '@kix/core/dist/browser/user/UserStore';
import { User, LoadUsersRequest } from '@kix/core/dist/model/';

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
        UserStore.getInstance().addStateListener(this.userStateChanged.bind(this));
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration('user-list-widget', this.state.instanceId);

        if (!this.componentInitialized && this.state.widgetConfiguration) {
            this.componentInitialized = true;
            this.loadUser();
        }
    }

    public userStateChanged(): void {
        const users: User[] = UserStore.getInstance().getUsers(this.state.instanceId);
        if (users) {
            this.state.users = users;
        }
    }

    public saveConfiguration(): void {
        DashboardStore.getInstance().saveWidgetConfiguration(
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
        const settings = this.state.widgetConfiguration.contentConfiguration;
        UserStore.getInstance().loadUser(this.state.instanceId, settings.properties, settings.limit);
    }
}

module.exports = UserListWidgetComponent;
