/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { PermissionProperty } from './model/PermissionProperty';
import { SortOrder } from '../../model/SortOrder';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';


import { KIXExtension } from '../../../../server/model/KIXExtension';
import { RoleDetailsContext } from './webapp/core/admin/context/RoleDetailsContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return RoleDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const userRoleInfoWidget = new WidgetConfiguration(
            'user-role-details-info-widget', 'User role info widget', ConfigurationType.Widget,
            'user-role-info-widget', 'Translatable#Role Information', [], null, null,
            false, true, WidgetSize.BOTH, false
        );
        configurations.push(userRoleInfoWidget);

        const tabSettings = new TabWidgetConfiguration(
            'user-role-details-tab-widget-settings', 'User role tab widget settings', ConfigurationType.TabWidget,
            ['user-role-details-info-widget']
        );
        configurations.push(tabSettings);

        const tabWidgetConfig = new WidgetConfiguration(
            'user-role-details-tab-widget', 'User role details tab widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('user-role-details-tab-widget-settings', ConfigurationType.TabWidget)
        );
        configurations.push(tabWidgetConfig);

        const assignedUserWidgetConfig = new WidgetConfiguration(
            'user-role-details-assigned-users-widget', 'User role assigned users widget', ConfigurationType.Widget,
            'user-role-assigned-users-widget', 'Translatable#Assigned Agents', [], null, null, true, true,
        );
        configurations.push(assignedUserWidgetConfig);

        // assigned permission widget
        const tableConfig = new TableConfiguration(
            'user-role-details-asigned-permission-table', 'User role assigned permission table',
            ConfigurationType.Table, KIXObjectType.ROLE_PERMISSION, null, 24
        );
        configurations.push(tableConfig);

        const permissionTable = new TableWidgetConfiguration(
            'user-role-details-assigned-permission-table-widget',
            'User role assigned permission table widget',
            ConfigurationType.TableWidget,
            KIXObjectType.ROLE_PERMISSION, [PermissionProperty.TYPE_ID, SortOrder.UP],
            new ConfigurationDefinition('user-role-details-asigned-permission-table', ConfigurationType.Table),
            null, null, false, false, null, false
        );
        configurations.push(permissionTable);

        const assignedPermissionsWidgetConfig = new WidgetConfiguration(
            'user-role-details-assigned-permissions-widget', 'User role assigned permission widget',
            ConfigurationType.Widget,
            'table-widget', 'Translatable#Permissions', [],
            new ConfigurationDefinition('user-role-details-assigned-permission-table-widget',
                ConfigurationType.TableWidget),
            null, true, true, null, true
        );
        configurations.push(assignedPermissionsWidgetConfig);

        configurations.push(
            new ContextConfiguration(
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
                    'user-admin-role-edit-action'
                ],
                [],
                [
                    new ConfiguredWidget('user-role-details-info-widget', 'user-role-details-info-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
