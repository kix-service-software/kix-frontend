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

    public id = 'kix-module-toast';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './toast/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-toast$0/webapp/core/ToastUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('refresh-app-toast', '/kix-module-toast$0/webapp/components/refresh-app-toast', []),
        new UIComponent('success-toast', '/kix-module-toast$0/webapp/components/success-toast', []),
        new UIComponent('info-toast', '/kix-module-toast$0/webapp/components/info-toast', []),
        new UIComponent('error-toast', '/kix-module-toast$0/webapp/components/error-toast', []),
        new UIComponent('confirm-modal', '/kix-module-toast$0/webapp/components/confirm-modal', [])
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};