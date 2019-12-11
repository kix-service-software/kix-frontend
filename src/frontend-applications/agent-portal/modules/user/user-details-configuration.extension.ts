/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { UserDetailsContext } from "./webapp/core/admin";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { TabWidgetConfiguration } from "../../model/configuration/TabWidgetConfiguration";
import { ConfigurationDefinition } from "../../model/configuration/ConfigurationDefinition";
import { WidgetSize } from "../../model/configuration/WidgetSize";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ConfiguredWidget } from "../../model/configuration/ConfiguredWidget";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return UserDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const userInfoWidgetConfig = new WidgetConfiguration(
            'user-details-info-widget', 'User info widget', ConfigurationType.Widget,
            'user-info-widget', 'Translatable#Agent Information', [], null, null,
            false, true, null, false
        );
        configurations.push(userInfoWidgetConfig);

        const tabWidgetSettings = new TabWidgetConfiguration(
            'user-details-tab-widget-settings', 'User details tab widget settings', ConfigurationType.TabWidget,
            ['user-details-info-widget']
        );
        configurations.push(tabWidgetSettings);

        const tabWidgetConfiguration = new WidgetConfiguration(
            'user-details-tab-widget', 'User details tab widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('user-details-tab-widget-settings', ConfigurationType.TabWidget)
        );
        configurations.push(tabWidgetConfiguration);


        const personalSettingsConfig = new WidgetConfiguration(
            'user-personal-settings-widget', 'User details personal settings widget', ConfigurationType.Widget,
            'user-personal-settings-widget', 'Translatable#Preferences', [], null, null, true, true, WidgetSize.BOTH
        );
        configurations.push(personalSettingsConfig);

        const assignedRolesConfig = new WidgetConfiguration(
            'user-assigned-roles-widget', 'User assigned roles', ConfigurationType.Widget,
            'user-assigned-roles-widget', 'Translatable#Assigned Roles', [], null, null, false, true, WidgetSize.BOTH
        );
        configurations.push(assignedRolesConfig);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'User Details', ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('user-details-tab-widget', 'user-details-tab-widget'),
                    new ConfiguredWidget('user-personal-settings-widget', 'user-personal-settings-widget'),
                    new ConfiguredWidget('user-assigned-roles-widget', 'user-assigned-roles-widget')
                ],
                [],
                [
                    'user-admin-user-create-action'
                ],
                [
                    'user-admin-user-edit-action', 'print-action'
                ],
                [],
                [
                    new ConfiguredWidget('user-details-info-widget', 'user-details-info-widget')
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