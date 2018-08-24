import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'cmdb/dialogs/new-config-item-dialog',
            'cmdb/inputs/ci-class-reference-input'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['new-config-item-dialog', 'cmdb/dialogs/new-config-item-dialog'],
            ['ci-class-reference-input', 'cmdb/inputs/ci-class-reference-input']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
