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

    public id = 'notification-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('notification-component', '/kix-module-notification$0/webapp/core/NotificationUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('admin-notifications', '/kix-module-notification$0/webapp/components/admin-notifications', []),
        new UIComponent(
            'notification-input-events', '/kix-module-notification$0/webapp/components/notification-input-events', []
        ),
        new UIComponent(
            'notification-input-email-recipient',
            '/kix-module-notification$0/webapp/components/notification-input-email-recipient',
            []
        ),
        new UIComponent(
            'notification-input-filter', '/kix-module-notification$0/webapp/components/notification-input-filter', []
        ),
        new UIComponent(
            'notification-info-widget', '/kix-module-notification$0/webapp/components/notification-info-widget', []
        ),
        new UIComponent(
            'notification-label-widget', '/kix-module-notification$0/webapp/components/notification-label-widget', []
        ),
        new UIComponent(
            'notification-text-widget', '/kix-module-notification$0/webapp/components/notification-text-widget', []
        ),
        new UIComponent(
            'notification-filter-cell-content',
            '/kix-module-notification$0/webapp/components/notification-filter-cell-content', []
        ),
        new UIComponent(
            'setup-notification-template',
            '/kix-module-notification$0/webapp/components/setup-notification-template', []
        )
    ];

    public webDependencies: string[] = [
        './notification/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
