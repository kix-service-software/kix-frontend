import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class ReportsMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/reports"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['reports', 'modules/reports']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new ReportsMarkoDependencyExtension();
};
