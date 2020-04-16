/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";
import { UIComponent } from "../../model/UIComponent";

import { KIXExtension } from "../../../../server/model/KIXExtension";

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'mail-account-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('mail-account-component', '/kix-module-mail-account$0/webapp/core/MailAccountUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'mail-account-input-types',
            '/kix-module-mail-account$0/webapp/components/mail-account-input-types',
            []
        ),
        new UIComponent(
            'mail-account-info-widget', '/kix-module-mail-account$0/webapp/components/mail-account-info-widget', []
        ),
        new UIComponent(
            'admin-mail-accounts', '/kix-module-mail-account$0/webapp/components/admin-mail-accounts', []
        ),
        new UIComponent(
            'new-mail-account-dialog', '/kix-module-mail-account$0/webapp/components/new-mail-account-dialog', []
        ),
        new UIComponent(
            'edit-mail-account-dialog', '/kix-module-mail-account$0/webapp/components/edit-mail-account-dialog', []
        ),
    ];

    public webDependencies: string[] = [
        './mail-account/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
