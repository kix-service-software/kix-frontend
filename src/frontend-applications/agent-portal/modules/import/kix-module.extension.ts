/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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

    public id = 'import-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('import-component', '/kix-module-import$0/webapp/core/ImportUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('import-dialog', '/kix-module-import$0/webapp/components/import-dialog', [])
    ];

    public webDependencies: string[] = [
        './import/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
