import {
    AbstractMarkoComponent, ActionFactory, ContextService, TableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, Role } from '../../../../../core/model';
import { RoleDetailsContext } from '../../../../../core/browser/user';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<RoleDetailsContext>(
            RoleDetailsContext.CONTEXT_ID
        );

        context.registerListener('user-role-assigned-users-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, role: Role, type: KIXObjectType) => {
                if (type === KIXObjectType.ROLE) {
                    this.initWidget(role);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<Role>());
    }

    private async initWidget(role: Role): Promise<void> {
        const tableConfiguration = new TableConfiguration(
            KIXObjectType.USER, null, 32, null, null, false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            'user-role-assigned-users', KIXObjectType.USER, tableConfiguration, role.UserIDs, null, true
        );
        this.state.table = table;
        this.setActions(role);
    }

    private setActions(role: Role): void {
        if (this.state.widgetConfiguration && role) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [role]
            );
        }
    }

}

module.exports = Component;
