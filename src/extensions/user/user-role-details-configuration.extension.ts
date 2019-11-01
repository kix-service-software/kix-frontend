/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TableWidgetConfiguration,
    KIXObjectType, PermissionProperty, SortOrder, TabWidgetConfiguration
} from '../../core/model';
import { TicketPriorityDetailsContext } from '../../core/browser/ticket';
import { RoleDetailsContext } from '../../core/browser/user';
import { TableConfiguration } from '../../core/browser';
import { ModuleConfigurationService } from '../../services';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return RoleDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const userRoleInfoWidget = new WidgetConfiguration(
            'user-role-details-info-widget', 'User role info widget', ConfigurationType.Widget,
            'user-role-info-widget', 'Translatable#Role Information', [], null, null,
            false, true, WidgetSize.BOTH, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(userRoleInfoWidget);

        const tabSettings = new TabWidgetConfiguration(
            'user-role-details-tab-widget-settings', 'User role tab widget settings', ConfigurationType.TabWidget,
            ['user-role-details-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabSettings);

        const tabWidgetConfig = new WidgetConfiguration(
            'user-role-details-tab-widget', 'User role details tab widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('user-role-details-tab-widget-settings', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabWidgetConfig);

        const assignedUserWidgetConfig = new WidgetConfiguration(
            'user-role-details-assigned-users-widget', 'User role assigned users widget', ConfigurationType.Widget,
            'user-role-assigned-users-widget', 'Translatable#Assigned Agents', [], null, true, true,
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(assignedUserWidgetConfig);

        // assigned permission widget
        const tableConfig = new TableConfiguration(
            'user-role-details-asigned-permission-table', 'User role assigned permission table',
            ConfigurationType.Table,
            KIXObjectType.ROLE_PERMISSION
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableConfig);

        const permissionTable = new TableWidgetConfiguration(
            'user-role-details-assigned-permission-table-widget',
            'User role assigned permission table widget',
            ConfigurationType.TableWidget,
            KIXObjectType.ROLE_PERMISSION, [PermissionProperty.TYPE_ID, SortOrder.UP],
            new ConfigurationDefinition('user-role-details-asigned-permission-table', ConfigurationType.Table),
            null, null, false, false, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(permissionTable);

        const assignedPermissionsWidgetConfig = new WidgetConfiguration(
            'user-role-details-assigned-permissions-widget', 'User role assigned permission widget',
            ConfigurationType.Widget,
            'table-widget', 'Translatable#Permissions', [],
            new ConfigurationDefinition('user-role-details-assigned-permission-table-widget',
                ConfigurationType.TableWidget),
            null, true, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(assignedPermissionsWidgetConfig);

        return new ContextConfiguration(
            RoleDetailsContext.CONTEXT_ID, 'User role details', ConfigurationType.Context,
            RoleDetailsContext.CONTEXT_ID, [], [],
            [
                new ConfiguredWidget('user-role-details-tab-widget', 'user-role-details-tab-widget'),
                new ConfiguredWidget(
                    'user-role-details-assigned-permissions-widget', 'user-role-details-assigned-permissions-widget'
                ),
                new ConfiguredWidget(
                    'user-role-details-assigned-users-widget', 'user-role-details-assigned-users-widget'
                )
            ], [],
            [
                'user-admin-role-create-action'
            ],
            [
                'user-admin-role-edit-action', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('user-role-details-info-widget', 'user-role-details-info-widget')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
