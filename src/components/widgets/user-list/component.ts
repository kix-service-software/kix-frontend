import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

import { UserListComponentState } from './model/UserListComponentState';

import { UserService } from '@kix/core/dist/browser/user/UserService';
import { User, LoadUsersRequest } from '@kix/core/dist/model/';
import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
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
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));

        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.loadUser();
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_UPDATED) {
            const context = ContextService.getInstance().getContext();
            this.state.widgetConfiguration =
                context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
            (this as any).setStateDirty('widgetConfiguration');
        } else if (type === ContextNotification.OBJECT_LIST_UPDATED && id === this.state.instanceId) {
            const users: User[] = args[0];
            this.state.users = users ? users : [];
        }
    }

    private loadUser(): void {
        const settings = this.state.widgetConfiguration.settings;
        UserService.getInstance().loadUser(this.state.instanceId, settings.properties, settings.limit);
    }
}

module.exports = UserListWidgetComponent;
