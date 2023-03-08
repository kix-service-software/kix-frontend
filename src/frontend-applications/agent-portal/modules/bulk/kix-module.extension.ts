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

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'bulk-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('bulk-component', '/kix-module-bulk$0/webapp/core/BulkUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('bulk-form', '/kix-module-bulk$0/webapp/components/bulk-form', []),
        new UIComponent('bulk-dialog', '/kix-module-bulk$0/webapp/components/bulk-dialog', [])
    ];

    public webDependencies: string[] = [
        './bulk/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
