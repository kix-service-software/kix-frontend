import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class MainMenuMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "main-menu/main-menu-ps",
            "personal-settings/personal-settings-container",
            "personal-settings/personal-settings-toolbar"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['main-menu', 'modules/main-menu'],
            ['personal-settings-container', 'personal-settings/personal-settings-container'],
            ['personal-settings-toolbar', 'personal-settings/personal-settings-toolbar']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new MainMenuMarkoDependencyExtension();
};
