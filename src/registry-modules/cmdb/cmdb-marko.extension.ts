import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'cmdb/cmdb-module',
            'cmdb/dialogs/new-config-item-dialog',
            'cmdb/config-item-details',
            'cmdb/inputs/ci-class-input',
            'cmdb/inputs/ci-class-reference-input',
            'cmdb/config-item-version-details',
            'cmdb/widgets/config-item-info-widget',
            'cmdb/widgets/config-item-history-widget',
            'cmdb/widgets/config-item-graph-widget',
            'cmdb/widgets/config-item-class-explorer',
            'cmdb/widgets/config-item-chart-widget',
            'cmdb/widgets/config-item-list-widget',
            'cmdb/widgets/config-item-version-widget',
            'cmdb/widgets/config-item-images-widget'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['cmdb-module', 'cmdb/cmdb-module'],
            ['new-config-item-dialog', 'cmdb/dialogs/new-config-item-dialog'],
            ['config-item-details', 'cmdb/config-item-details'],
            ['config-item-version-details', 'cmdb/config-item-version-details'],
            ['ci-class-reference-input', 'cmdb/inputs/ci-class-reference-input'],
            ['ci-class-input', 'cmdb/inputs/ci-class-input'],
            ['config-item-info-widget', 'cmdb/widgets/config-item-info-widget'],
            ['config-item-history-widget', 'cmdb/widgets/config-item-history-widget'],
            ['config-item-graph-widget', 'cmdb/widgets/config-item-graph-widget'],
            ['config-item-class-explorer', 'cmdb/widgets/config-item-class-explorer'],
            ['config-item-chart-widget', 'cmdb/widgets/config-item-chart-widget'],
            ['config-item-list-widget', 'cmdb/widgets/config-item-list-widget'],
            ['config-item-version-widget', 'cmdb/widgets/config-item-version-widget'],
            ['config-item-images-widget', 'cmdb/widgets/config-item-images-widget']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
