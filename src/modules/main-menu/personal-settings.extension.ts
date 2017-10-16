import { IPersonalSettingsExtension, PersonalSettings } from '@kix/core';

export class MainMenuPersonalSettings implements IPersonalSettingsExtension<any, any> {

    public getPersonalSettings(): PersonalSettings<any, any> {
        return new PersonalSettings(
            "main-menu",
            "Hauptmenü",
            "Nutzerspezifische Einstellungen für das Hauptmenü.",
            this.getTemplatePath(),
            this.getDefaultConfiguration(),
            this.getConfigurationContent()
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
            secondaryMenuEntries: []
        };
    }

    public getConfigurationContent(): any {
        return {
            availableMenuEntries: []
        };
    }

}
