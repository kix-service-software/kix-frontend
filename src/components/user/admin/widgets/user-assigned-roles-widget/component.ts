import {
    AbstractMarkoComponent, ActionFactory, ContextService, TableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, RoleProperty, User } from '../../../../../core/model';
import { UserDetailsContext } from '../../../../../core/browser/user';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<UserDetailsContext>(
            UserDetailsContext.CONTEXT_ID
        );

        context.registerListener('user-assigned-roles-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, user: User, type: KIXObjectType) => {
                if (type === KIXObjectType.USER) {
                    this.initWidget(user);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<User>());
    }

    private async initWidget(user: User): Promise<void> {
        const columns = [
            new DefaultColumnConfiguration(
                RoleProperty.NAME, true, false, true, false, 250, true, true, false
            ),
            new DefaultColumnConfiguration(
                RoleProperty.COMMENT, true, false, true, false, 250, true, true, false
            ),
            new DefaultColumnConfiguration(RoleProperty.VALID_ID, true, false, true, false, 100, true, true)
        ];
        const tableConfiguration = new TableConfiguration(
            KIXObjectType.ROLE, null, null, columns, null, false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await await TableFactoryService.getInstance().createTable(
            'user-assigned-roles', KIXObjectType.ROLE, tableConfiguration, user.RoleIDs, null, true
        );
        this.state.table = table;
        this.prepareActions(user);
    }

    private async prepareActions(user: User): Promise<void> {
        if (this.state.widgetConfiguration && user) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [user]
            );
        }
    }

}

module.exports = Component;
