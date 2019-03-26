import { IConfigurationExtension } from '../../../core/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '../../../core/model';
import { TicketPriorityDetailsContext } from '../../../core/browser/ticket';
import { RoleDetailsContextConfiguration, RoleDetailsContext } from '../../../core/browser/user';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return RoleDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const assignedUsersWidget = new ConfiguredWidget('user-role-assigned-users-widget', new WidgetConfiguration(
            'user-role-assigned-users-widget', 'Translatable#Assigned Agents', [], null, true, true,
        ));

        const assignedPermissionsWidget = new ConfiguredWidget('user-role-assigned-permissions-widget',
            new WidgetConfiguration(
                'user-role-assigned-permissions-widget', 'Translatable#Permissions', [], null, true, true,
            ));

        const userRoleInfoWidget = new ConfiguredWidget('user-role-info-widget', new WidgetConfiguration(
            'user-role-info-widget', 'Translatable#Role Information', ['user-admin-role-edit-action'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        return new RoleDetailsContextConfiguration(
            TicketPriorityDetailsContext.CONTEXT_ID, [], [], [], [],
            ['user-role-assigned-permissions-widget', 'user-role-assigned-users-widget'],
            [assignedPermissionsWidget, assignedUsersWidget],
            ['user-role-info-widget'], [userRoleInfoWidget],
            [], [],
            ['user-admin-role-create-action'],
            ['user-admin-role-edit-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
