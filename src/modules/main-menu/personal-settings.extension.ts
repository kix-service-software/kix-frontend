import { MenuEntry } from '@kix/core/dist/model/client';
import {
    IPersonalSettingsExtension,
    PersonalSettings,
    IMainMenuExtension,
    IPluginService,
    KIXExtensions,
    MenuEntryConfiguration
} from '@kix/core';
import { container } from '../../Container';

export class MainMenuPersonalSettingsExtension implements IPersonalSettingsExtension {

    public async getPersonalSettings(): Promise<PersonalSettings> {

        const configurationContent = await this.getConfigurationContent();

        return new PersonalSettings(
            "main-menu",
            "Hauptmenü",
            "Nutzerspezifische Einstellungen für das Hauptmenü.",
            this.getTemplatePath(),
            this.getDefaultConfiguration(),
            configurationContent
        );
    }

    public getTemplatePath(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/main-menu/main-menu-ps/';
    }

    public getDefaultConfiguration(): any {
        return {
            primaryMenuEntries: [],
            secondaryMenuEntries: [],
            showText: true
        };
    }

    public async getConfigurationContent(): Promise<any> {
        const pluginService = container.getDIContainer().get<IPluginService>("IPluginService");
        const extensions = await pluginService.getExtensions<IMainMenuExtension>(KIXExtensions.MAIN_MENU);

        const availableMenuEntries = extensions.map(
            (me) => new MenuEntry(me.getLink(), me.getIcon(), me.getText(), me.getContextId())
        );

        return { availableMenuEntries };
    }

}

module.exports = (data, host, options) => {
    return new MainMenuPersonalSettingsExtension();
};
