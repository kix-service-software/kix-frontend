import { IMarkoDependencyExtension } from './../../../extensions/IMarkoDependencyExtension';

export class StatisticsWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/statistics",
            "widgets/statistics/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new StatisticsWidgetMarkoDependencyExtension();
};
