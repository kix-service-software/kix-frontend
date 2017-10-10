import { IMarkoDependencyExtension } from '@kix/core';

export class ReportsMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/reports"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new ReportsMarkoDependencyExtension();
};
