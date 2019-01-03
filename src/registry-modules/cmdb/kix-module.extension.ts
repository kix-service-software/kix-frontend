import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

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
        ['config-item-images-widget', 'cmdb/widgets/config-item-images-widget'],
        ['cmdb-admin-ci-classes', 'cmdb/admin/cmdb-admin-ci-classes'],
        ['config-item-class-details', 'cmdb/admin/config-item-class-details'],
        ['config-item-class-info-widget', 'cmdb/admin/widgets/config-item-class-info-widget'],
        ['config-item-class-permissions-widget', 'cmdb/admin/widgets/config-item-class-permissions-widget'],
        ['config-item-class-versions-widget', 'cmdb/admin/widgets/config-item-class-versions-widget'],
        ['config-item-class-definition', 'cmdb/config-item-class-definition'],
        ['new-config-item-class-dialog', 'cmdb/admin/dialogs/new-config-item-class-dialog'],
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
