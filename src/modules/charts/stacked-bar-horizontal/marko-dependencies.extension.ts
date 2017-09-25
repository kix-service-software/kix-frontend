import { IMarkoDependencyExtension } from '@kix/core';

export class StackedBarChartHorizontalMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "base-components/charts/stacked-bar-horizontal"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new StackedBarChartHorizontalMarkoDependencyExtension();
};
