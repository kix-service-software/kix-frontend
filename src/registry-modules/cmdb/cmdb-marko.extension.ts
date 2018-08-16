import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'cmdb/dialogs/new-config-item-dialog',
            'cmdb/inputs/ci-deployment-state-input',
            'cmdb/inputs/ci-incident-state-input'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['new-config-item-dialog', 'cmdb/dialogs/new-config-item-dialog'],
            ['ci-deployment-state-input', 'cmdb/inputs/ci-deployment-state-input'],
            ['ci-incident-state-input', 'cmdb/inputs/ci-incident-state-input']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
