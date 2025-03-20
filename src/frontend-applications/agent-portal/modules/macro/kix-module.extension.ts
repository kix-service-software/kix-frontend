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

class Extension extends KIXExtension implements IKIXModuleExtension {

    public id = 'kix-module-macro';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './macro/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-macro$0/webapp/core/MacroUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('macro-action-details', '/kix-module-macro$0/webapp/components/macro-action-details', [])
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};