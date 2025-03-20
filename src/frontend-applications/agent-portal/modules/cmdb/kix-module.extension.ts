/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'cmdb-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('cmdb-admin-module-component', '/kix-module-cmdb$0/webapp/core/CMDBAdminUIModule', [
            new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE], true)
        ]),
        new UIComponent('cmdb-module-read-component', '/kix-module-cmdb$0/webapp/core/CMDBReadUIModule', [
            new UIComponentPermission('cmdb/configitems', [CRUD.READ])
        ]),
        new UIComponent('cmdb-module-edit-component', '/kix-module-cmdb$0/webapp/core/CMDBEditUIModule', [
            new UIComponentPermission('cmdb/configitems', [CRUD.CREATE]),
            new UIComponentPermission('system/cmdb/classes', [CRUD.READ])
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('asset-class-chooser', '/kix-module-cmdb$0/webapp/components/asset-class-chooser', []),
        new UIComponent('cmdb-admin-ci-classes', '/kix-module-cmdb$0/webapp/components/cmdb-admin-ci-classes', []),
        new UIComponent(
            'config-item-class-info-widget', '/kix-module-cmdb$0/webapp/components/config-item-class-info-widget', []
        ),
        new UIComponent(
            'config-item-class-definition', '/kix-module-cmdb$0/webapp/components/config-item-class-definition', []
        ),
        new UIComponent(
            'cmdb-admin-general-catalog', '/kix-module-cmdb$0/webapp/components/cmdb-admin-general-catalog', []
        ),
        new UIComponent('cmdb-module', '/kix-module-cmdb$0/webapp/components/cmdb-module', []),
        new UIComponent('config-item-info', '/kix-module-cmdb$0/webapp/components/config-item-info', []),
        new UIComponent(
            'config-item-version-details', '/kix-module-cmdb$0/webapp/components/config-item-version-details', []
        ),
        new UIComponent(
            'config-item-history-widget', '/kix-module-cmdb$0/webapp/components/config-item-history-widget', []
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
        new UIComponent('go-to-version-cell', '/kix-module-cmdb$0/webapp/components/go-to-version-cell', []),
        new UIComponent(
            'add-to-affected-assets-cell', '/kix-module-cmdb$0/webapp/components/add-to-affected-assets-cell', []
        )
    ];

    public webDependencies: string[] = [
        './cmdb/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
