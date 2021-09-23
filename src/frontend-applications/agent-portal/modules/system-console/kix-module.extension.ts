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

    public webDependencies: string[] = ['./system-console/webapp'];

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'kix-module-console';

    public initComponents: UIComponent[] = [
        new UIComponent('system-console-module-component', '/kix-module-console$0/webapp/core/ConsoleUIModule', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('system-admin-console', '/kix-module-console$0/webapp/components/system-admin-console', [])
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
