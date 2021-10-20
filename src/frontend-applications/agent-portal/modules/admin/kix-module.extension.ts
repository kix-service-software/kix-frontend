/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public webDependencies: string[] = [
        './admin/webapp'
    ];

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'application-admin-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('admin-module-component', '/kix-module-admin$0/webapp/core/AdminUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('admin', '/kix-module-admin$0/webapp/components/admin-module', []),
        new UIComponent('admin-modules-explorer', '/kix-module-admin$0/webapp/components/admin-modules-explorer', []),
        new UIComponent(
            'setup-system-settings', '/kix-module-admin$0/webapp/components/setup-system-settings', []
        )
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
