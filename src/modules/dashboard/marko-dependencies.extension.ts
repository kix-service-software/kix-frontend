import { IMarkoDependencyExtension } from '@kix/core';

export class DashboardMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "dashboard"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new DashboardMarkoDependencyExtension();
};
