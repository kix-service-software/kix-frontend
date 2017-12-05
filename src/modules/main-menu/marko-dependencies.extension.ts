import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class MainMenuMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "main-menu/main-menu-ps"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['main-menu', 'modules/main-menu']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new MainMenuMarkoDependencyExtension();
};
