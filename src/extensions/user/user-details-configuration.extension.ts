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
    ConfiguredWidget, WidgetConfiguration, WidgetSize, ContextConfiguration, TabWidgetSettings
} from '../../core/model';
import { TicketPriorityDetailsContext } from '../../core/browser/ticket';
import { UserDetailsContext } from '../../core/browser/user';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return UserDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('user-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['user-info-widget']))
        );

        const userInfoWidget = new ConfiguredWidget('user-info-widget', new WidgetConfiguration(
            'user-info-widget', 'Translatable#Agent Information', [], null,
            false, true, null, false
        ));

        const personalSettingsWidget = new ConfiguredWidget('user-personal-settings-widget', new WidgetConfiguration(
            'user-personal-settings-widget', 'Translatable#Preferences', [], null, true, true, WidgetSize.BOTH
        ));

        const assignedRolesWidget = new ConfiguredWidget('user-assigned-roles-widget', new WidgetConfiguration(
            'user-assigned-roles-widget', 'Translatable#Assigned Roles', [], null, false, true, WidgetSize.BOTH
        ));

        return new ContextConfiguration(
            TicketPriorityDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            ['user-details-tab-widget', 'user-personal-settings-widget', 'user-assigned-roles-widget'],
            [tabLane, personalSettingsWidget, assignedRolesWidget, userInfoWidget],
            [], [],
            ['user-admin-user-create-action'],
            ['user-admin-user-edit-action', 'print-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
