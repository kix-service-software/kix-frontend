import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class AssignTourActionMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "actions/assign-tour"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new AssignTourActionMarkoDependencyExtension();
};
