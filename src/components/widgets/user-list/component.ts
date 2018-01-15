import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

import { UserListComponentState } from './model/UserListComponentState';

import { UserStore } from '@kix/core/dist/browser/user/UserStore';
import { User, LoadUsersRequest } from '@kix/core/dist/model/';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';

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
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));

        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.loadUser();
    }

    private userStateChanged(): void {
        const users: User[] = UserStore.getInstance().getUsers(this.state.instanceId);
        if (users) {
            this.state.users = users;
        }
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_UPDATED) {
            const context = ContextService.getInstance().getContext();
            this.state.widgetConfiguration =
                context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
            (this as any).setStateDirty('widgetConfiguration');
        }
    }

    private loadUser(): void {
        const settings = this.state.widgetConfiguration.settings;
        UserStore.getInstance().loadUser(this.state.instanceId, settings.properties, settings.limit);
    }
}

module.exports = UserListWidgetComponent;
