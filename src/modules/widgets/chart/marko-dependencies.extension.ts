import { IMarkoDependencyExtension } from '@kix/core';

export class ChartWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/chart",
            "widgets/chart/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetMarkoDependencyExtension();
};
