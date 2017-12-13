import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class DashboardMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/home"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['home', 'modules/home']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new DashboardMarkoDependencyExtension();
};
