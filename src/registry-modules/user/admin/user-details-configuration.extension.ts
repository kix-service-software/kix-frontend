import { IConfigurationExtension } from '../../../core/extensions';
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize } from '../../../core/model';
import { TicketPriorityDetailsContext } from '../../../core/browser/ticket';
import { UserDetailsContextConfiguration, UserDetailsContext } from '../../../core/browser/user';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return UserDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const userInfoWidget = new ConfiguredWidget('user-info-widget', new WidgetConfiguration(
            'user-info-widget', 'Translatable#Agent Information', ['user-admin-user-edit-action'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const personalSettingsWidget = new ConfiguredWidget('user-personal-settings-widget', new WidgetConfiguration(
            'user-personal-settings-widget', 'Translatable#Preferences', [], null, true, true, WidgetSize.BOTH
        ));

        const assignedRolesWidget = new ConfiguredWidget('user-assigned-roles-widget', new WidgetConfiguration(
            'user-assigned-roles-widget', 'Translatable#Assigned Roles', [], null, false, true, WidgetSize.BOTH
        ));

        return new UserDetailsContextConfiguration(
            TicketPriorityDetailsContext.CONTEXT_ID, [], [], [], [],
            ['user-personal-settings-widget', 'user-assigned-roles-widget'],
            [personalSettingsWidget, assignedRolesWidget],
            ['user-info-widget'], [userInfoWidget],
            [], [],
            ['user-admin-user-create-action'],
            ['user-admin-user-edit-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
