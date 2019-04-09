import { IConfigurationExtension } from '../../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TableWidgetSettings,
    KIXObjectType, PermissionProperty, SortOrder, DataType
} from '../../../core/model';
import { TicketPriorityDetailsContext } from '../../../core/browser/ticket';
import { RoleDetailsContextConfiguration, RoleDetailsContext } from '../../../core/browser/user';
import { TableConfiguration, DefaultColumnConfiguration } from '../../../core/browser';

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
                'table-widget', 'Translatable#Permissions', [],
                new TableWidgetSettings(
                    KIXObjectType.ROLE_PERMISSION, [PermissionProperty.TYPE_ID, SortOrder.UP],
                    new TableConfiguration(KIXObjectType.ROLE_PERMISSION, null, null, [
                        new DefaultColumnConfiguration(
                            PermissionProperty.TYPE_ID, true, false, true, false, 150, true, true, true,
                            DataType.STRING, true, null, null, false
                        ),
                        new DefaultColumnConfiguration(
                            PermissionProperty.TARGET, true, false, true, false, 250, true, true, false,
                            DataType.STRING, true, null, null, false
                        ),
                        new DefaultColumnConfiguration(
                            PermissionProperty.IS_REQUIRED, false, true, true, false, 85, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            PermissionProperty.CREATE, false, false, true, false, 85,
                            false, true, true, null, null, 'crud-cell'
                        ),
                        new DefaultColumnConfiguration(
                            PermissionProperty.READ, false, false, true, false, 85,
                            false, true, true, null, null, 'crud-cell'
                        ),
                        new DefaultColumnConfiguration(
                            PermissionProperty.UPDATE, false, false, true, false, 85,
                            false, true, true, null, null, 'crud-cell'
                        ),
                        new DefaultColumnConfiguration(
                            PermissionProperty.DELETE, false, false, true, false, 85,
                            false, true, true, null, null, 'crud-cell'
                        ),
                        new DefaultColumnConfiguration(
                            PermissionProperty.DENY, false, false, true, false, 85,
                            false, true, true, null, null, 'crud-cell'
                        )
                    ]), null, false
                ),
                true, true, null, null, true
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
