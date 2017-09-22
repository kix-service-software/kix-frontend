import { IMarkoDependencyExtension } from '@kix/core';

export class StackedBarChartMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "base-components/charts/stacked-bar"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new StackedBarChartMarkoDependencyExtension();
};
