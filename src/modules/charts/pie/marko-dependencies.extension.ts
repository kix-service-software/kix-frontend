import { IMarkoDependencyExtension } from '@kix/core';

export class PieChartMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "base-components/charts/pie"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new PieChartMarkoDependencyExtension();
};
