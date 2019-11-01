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
    ConfiguredWidget, WidgetConfiguration, WidgetSize, ContextConfiguration, TabWidgetConfiguration
} from '../../core/model';
import { TicketPriorityDetailsContext } from '../../core/browser/ticket';
import { UserDetailsContext } from '../../core/browser/user';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';
import { ConfigurationService } from '../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return UserDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const userInfoWidgetConfig = new WidgetConfiguration(
            'user-details-info-widget', 'User info widget', ConfigurationType.Widget,
            'user-info-widget', 'Translatable#Agent Information', [], null, null,
            false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(userInfoWidgetConfig);

        const tabWidgetSettings = new TabWidgetConfiguration(
            'user-details-tab-widget-settings', 'User details tab widget settings', ConfigurationType.TabWidget,
            ['user-details-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabWidgetSettings);

        const tabWidgetConfiguration = new WidgetConfiguration(
            'user-details-tab-widget', 'User details tab widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('user-details-tab-widget-settings', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabWidgetConfiguration);


        const personalSettingsConfig = new WidgetConfiguration(
            'user-personal-settings-widget', 'User details personal settings widget', ConfigurationType.Widget,
            'user-personal-settings-widget', 'Translatable#Preferences', [], null, null, true, true, WidgetSize.BOTH
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(personalSettingsConfig);

        const assignedRolesConfig = new WidgetConfiguration(
            'user-assigned-roles-widget', 'User assigned roles', ConfigurationType.Widget,
            'user-assigned-roles-widget', 'Translatable#Assigned Roles', [], null, null, false, true, WidgetSize.BOTH
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(assignedRolesConfig);

        return new ContextConfiguration(
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
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
