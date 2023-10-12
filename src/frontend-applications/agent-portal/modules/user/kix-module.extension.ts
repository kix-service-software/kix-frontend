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

    public id = 'user-module';

    public initComponents: UIComponent[] = [
        new UIComponent('user-module-component', '/kix-module-user$0/webapp/core/UserUIModule', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'user-admin-roles', '/kix-module-user$0/webapp/components/user-admin-roles', []),
        new UIComponent(
            'user-role-info-widget', '/kix-module-user$0/webapp/components/user-role-info-widget', []),
        new UIComponent(
            'user-role-assigned-users-widget',
            '/kix-module-user$0/webapp/components/user-role-assigned-users-widget', []
        ),
        new UIComponent('user-admin-users', '/kix-module-user$0/webapp/components/user-admin-users', []),
        new UIComponent(
            'user-personal-settings-widget',
            '/kix-module-user$0/webapp/components/user-personal-settings-widget', []),
        new UIComponent(
            'user-assigned-roles-widget',
            '/kix-module-user$0/webapp/components/user-assigned-roles-widget', []
        ),
        new UIComponent(
            'personal-settings-dialog',
            '/kix-module-user$0/webapp/components/personal-settings-dialog', []
        ),
        new UIComponent(
            'permissions-form-input',
            '/kix-module-user$0/webapp/components/permissions-form-input', []
        ),
        new UIComponent(
            'permission-input',
            '/kix-module-user$0/webapp/components/permission-input', []
        ),
        new UIComponent(
            'setup-superuser',
            '/kix-module-user$0/webapp/components/setup-superuser', []
        ),
        new UIComponent(
            'setup-admin-password',
            '/kix-module-user$0/webapp/components/setup-admin-password',
            []
        ),
        new UIComponent(
            'base-permission-input',
            '/kix-module-user$0/webapp/components/base-permission-input',
            []
        ),
        new UIComponent('user-token-input', '/kix-module-user$0/webapp/components/user-token-input', [])
    ];

    public webDependencies: string[] = [
        './user/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
