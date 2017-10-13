import { IMarkoDependencyExtension } from '@kix/core';

export class ChartWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/chart"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetMarkoDependencyExtension();
};
