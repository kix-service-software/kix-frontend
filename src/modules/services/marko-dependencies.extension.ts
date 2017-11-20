import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class ServicesMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/services"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new ServicesMarkoDependencyExtension();
};
