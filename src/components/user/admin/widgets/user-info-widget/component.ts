import { AbstractMarkoComponent, ActionFactory, ContextService } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, User } from '../../../../../core/model';
import { UserLabelProvider, UserDetailsContext } from '../../../../../core/browser/user';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new UserLabelProvider();

        const context = await ContextService.getInstance().getContext<UserDetailsContext>(
            UserDetailsContext.CONTEXT_ID
        );

        context.registerListener('user-role-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (userId: string, user: User, type: KIXObjectType) => {
                if (type === KIXObjectType.USER) {
                    this.initWidget(user);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<User>());
    }

    private async initWidget(user: User): Promise<void> {
        this.state.user = user;
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.user) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.user]
            );
        }
    }

}

module.exports = Component;
