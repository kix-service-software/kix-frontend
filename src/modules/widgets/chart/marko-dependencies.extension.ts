import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class ChartWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/chart",
            'widgets/chart/chart-configuration'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['chart', 'widgets/chart'],
            ['chart-configuration', 'widgets/chart/chart-configuration']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetMarkoDependencyExtension();
};
