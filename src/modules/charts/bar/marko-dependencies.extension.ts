import { IMarkoDependencyExtension } from './../../../extensions/';

export class BarChartMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "base-components/charts/bar"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new BarChartMarkoDependencyExtension();
};
