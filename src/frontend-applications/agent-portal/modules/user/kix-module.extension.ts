/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";

import { UIComponent } from "../../model/UIComponent";

class Extension implements IKIXModuleExtension {

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
            'new-user-role-dialog', '/kix-module-user$0/webapp/components/new-user-role-dialog', []),
        new UIComponent(
            'user-role-info-widget', '/kix-module-user$0/webapp/components/user-role-info-widget', []),
        new UIComponent(
            'user-role-assigned-users-widget',
            '/kix-module-user$0/webapp/components/user-role-assigned-users-widget', []
        ),
        new UIComponent(
            'edit-user-role-dialog', '/kix-module-user$0/webapp/components/edit-user-role-dialog', []),
        new UIComponent('user-admin-users', '/kix-module-user$0/webapp/components/user-admin-users', []),
        new UIComponent('new-user-dialog', '/kix-module-user$0/webapp/components/new-user-dialog', []),
        new UIComponent(
            'edit-user-dialog', '/kix-module-user$0/webapp/components/edit-user-dialog', []),
        new UIComponent(
            'user-info-widget', '/kix-module-user$0/webapp/components/user-info-widget', []),
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
        )
    ];

    public webDependencies: string[] = [
        './user/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};