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
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'object-tag-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-object-tag$0/webapp/core/ObjectTagUIModule',
            [
                new UIComponentPermission('system/config', [CRUD.READ]),
                new UIComponentPermission('objecttags', [CRUD.CREATE, CRUD.READ])
            ]
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('admin-object-tag', '/kix-module-object-tag$0/webapp/components/admin-object-tag', [])
    ];

    public webDependencies: string[] = [
        './object-tag/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
