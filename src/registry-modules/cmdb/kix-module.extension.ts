import { IKIXModuleExtension } from "@kix/core/dist/extensions";

class KIXModuleExtionsion implements IKIXModuleExtension {

    public initComponentId: string = 'cmdb-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['cmdb-module-component', 'cmdb/cmdb-module-component'],
        ['cmdb-module', 'cmdb/cmdb-module'],
        ['config-item-info', 'cmdb/config-item-info'],
        ['new-config-item-dialog', 'cmdb/dialogs/new-config-item-dialog'],
        ['edit-config-item-dialog', 'cmdb/dialogs/edit-config-item-dialog'],
        ['search-config-item-dialog', 'cmdb/dialogs/search-config-item-dialog'],
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

module.exports = (data, host, options) => {
    return new KIXModuleExtionsion();
};
