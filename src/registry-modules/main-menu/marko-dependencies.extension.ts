import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class MainMenuMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [];
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
