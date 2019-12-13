/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";
import { UIComponent } from "../../model/UIComponent";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { CRUD } from "../../../../server/model/rest/CRUD";

class Extension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'cmdb-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('cmdb-admin-module-component', '/kix-module-cmdb$0/webapp/core/CMDBAdminUIModule', [
            new UIComponentPermission('system/cmdb/classes/*', [CRUD.UPDATE], true),
            new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE], true)
        ]),
        new UIComponent('cmdb-module-read-component', '/kix-module-cmdb$0/webapp/core/CMDBReadUIModule', [
            new UIComponentPermission('cmdb/configitems', [CRUD.READ])
        ]),
        new UIComponent('cmdb-module-edit-component', '/kix-module-cmdb$0/webapp/core/CMDBEditUIModule', [
            new UIComponentPermission('cmdb/configitems/*', [CRUD.UPDATE]),
            new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.CREATE]),
            new UIComponentPermission('system/cmdb/classes', [CRUD.READ])
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('cmdb-admin-ci-classes', '/kix-module-cmdb$0/webapp/components/cmdb-admin-ci-classes', []),
        new UIComponent(
            'config-item-class-info-widget', '/kix-module-cmdb$0/webapp/components/config-item-class-info-widget', []
        ),
        new UIComponent(
            'config-item-class-definition', '/kix-module-cmdb$0/webapp/components/config-item-class-definition', []
        ),
        new UIComponent(
            'new-config-item-class-dialog', '/kix-module-cmdb$0/webapp/components/new-config-item-class-dialog', []
        ),
        new UIComponent(
            'edit-config-item-class-dialog', '/kix-module-cmdb$0/webapp/components/edit-config-item-class-dialog', []
        ),
        new UIComponent(
            'cmdb-admin-general-catalog', '/kix-module-cmdb$0/webapp/components/cmdb-admin-general-catalog', []
        ),
        new UIComponent(
            'new-general-catalog-dialog', '/kix-module-cmdb$0/webapp/components/new-general-catalog-dialog', []
        ),
        new UIComponent(
            'edit-general-catalog-dialog', '/kix-module-cmdb$0/webapp/components/edit-general-catalog-dialog', []
        ),
        new UIComponent('cmdb-module', '/kix-module-cmdb$0/webapp/components/cmdb-module', []),
        new UIComponent('config-item-info', '/kix-module-cmdb$0/webapp/components/config-item-info', []),
        new UIComponent('new-config-item-dialog', '/kix-module-cmdb$0/webapp/components/new-config-item-dialog', []),
        new UIComponent('edit-config-item-dialog', '/kix-module-cmdb$0/webapp/components/edit-config-item-dialog', []),
        new UIComponent(
            'search-config-item-dialog', '/kix-module-cmdb$0/webapp/components/search-config-item-dialog', []
        ),
        new UIComponent(
            'config-item-version-details', '/kix-module-cmdb$0/webapp/components/config-item-version-details', []
        ),
        new UIComponent('ci-class-input', '/kix-module-cmdb$0/webapp/components/ci-class-input', []),
        new UIComponent('config-item-info-widget', '/kix-module-cmdb$0/webapp/components/config-item-info-widget', []),
        new UIComponent(
            'config-item-history-widget', '/kix-module-cmdb$0/webapp/components/config-item-history-widget', []
        ),
        new UIComponent(
            'config-item-graph-widget', '/kix-module-cmdb$0/webapp/components/config-item-graph-widget', []
        ),
        new UIComponent(
            'config-item-class-explorer', '/kix-module-cmdb$0/webapp/components/config-item-class-explorer', []
        ),
        new UIComponent(
            'config-item-chart-widget', '/kix-module-cmdb$0/webapp/components/config-item-chart-widget', []
        ),
        new UIComponent(
            'config-item-images-widget', '/kix-module-cmdb$0/webapp/components/config-item-images-widget', []
        ),
        new UIComponent(
            'config-item-class-definition', '/kix-module-cmdb$0/webapp/components/config-item-class-definition', []
        ),
        new UIComponent(
            'compare-config-item-version-dialog',
            '/kix-module-cmdb$0/webapp/components/compare-config-item-version-dialog', []
        ),
        new UIComponent(
            'config-item-version-compare-legend',
            '/kix-module-cmdb$0/webapp/components/config-item-version-compare-legend', []
        ),
        new UIComponent('go-to-version-cell', '/kix-module-cmdb$0/webapp/components/go-to-version-cell', [])
    ];

    public webDependencies: string[] = [
        './cmdb/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
