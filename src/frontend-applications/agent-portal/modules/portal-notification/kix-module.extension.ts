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

    public id = 'kix-module-portal-notification';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './portal-notification/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-portal-notification$0/webapp/core/PortlNotificationUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('notification-list', '/kix-module-portal-notification$0/webapp/components/notification-list', []),
        new UIComponent('notification-info', '/kix-module-portal-notification$0/webapp/components/notification-info', []),
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};