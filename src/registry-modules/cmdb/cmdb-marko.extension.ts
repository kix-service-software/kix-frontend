import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'cmdb/dialogs/new-config-item-dialog',
            'cmdb/config-item-details',
            'cmdb/inputs/ci-class-reference-input',
            'cmdb/widgets/config-item-info-widget',
            'cmdb/widgets/config-item-linked-objects-widget'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['new-config-item-dialog', 'cmdb/dialogs/new-config-item-dialog'],
            ['config-item-details', 'cmdb/config-item-details'],
            ['ci-class-reference-input', 'cmdb/inputs/ci-class-reference-input'],
            ['config-item-info-widget', 'cmdb/widgets/config-item-info-widget'],
            ['config-item-linked-objects-widget', 'cmdb/widgets/config-item-linked-objects-widget']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
