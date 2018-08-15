import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'cmdb/dialogs/new-config-item-dialog'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['new-config-item-dialog', 'cmdb/dialogs/new-config-item-dialog']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
