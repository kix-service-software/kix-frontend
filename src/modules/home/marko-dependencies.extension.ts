import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class DashboardMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/home",
            'base-components/icon-bar/dashboard-configuration/dashboard-configuration-dialog'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['home', 'modules/home'],
            [
                'dashboard-configuration-dialog',
                'base-components/icon-bar/dashboard-configuration/dashboard-configuration-dialog'
            ]
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new DashboardMarkoDependencyExtension();
};
