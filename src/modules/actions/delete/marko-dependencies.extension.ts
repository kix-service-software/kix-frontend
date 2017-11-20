import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class DeleteActionMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "actions/delete"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new DeleteActionMarkoDependencyExtension();
};
