import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class HomeMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'home/home-module'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['home', 'home/home-module']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new HomeMarkoDependencyExtension();
};
