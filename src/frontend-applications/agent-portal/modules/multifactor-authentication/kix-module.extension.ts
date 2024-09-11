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

    public id = 'kix-module-multifactor-authentication';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './multifactor-authentication/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-multifactor-authentication$0/webapp/core/MultifactorAuthenticationUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('user-secret-input', '/kix-module-multifactor-authentication$0/webapp/components/user-secret-input', [])
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};