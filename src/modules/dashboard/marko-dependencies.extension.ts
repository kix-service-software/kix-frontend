import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class DashboardMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/dashboard"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['dashboard', 'modules/dashboard']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new DashboardMarkoDependencyExtension();
};
