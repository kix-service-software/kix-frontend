/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../model/UIComponentPermission';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'plugin-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'PluginUIModule', '/kix-module-plugin$0/webapp/core/PluginUIModule',
            [
                new UIComponentPermission('system/plugins', [CRUD.READ])
            ]
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('admin-plugins', '/kix-module-plugin$0/webapp/components/admin-plugins', [])
    ];

    public webDependencies: string[] = [
        './plugin/webapp'
    ];
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
