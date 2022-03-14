/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public id = 'mail-filter-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('mail-filter-component', '/kix-module-mail-filter$0/webapp/core/MailFilterUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'admin-mail-filters',
            '/kix-module-mail-filter$0/webapp/components/admin-mail-filters', []
        ),
        new UIComponent(
            'mail-filter-match-form-input',
            '/kix-module-mail-filter$0/webapp/components/mail-filter-match-form-input', []
        ),
        new UIComponent('mail-filter-match-input',
            '/kix-module-mail-filter$0/webapp/components/mail-filter-match-input', []
        ),
        new UIComponent(
            'mail-filter-set-form-input', '/kix-module-mail-filter$0/webapp/components/mail-filter-set-form-input', []
        ),
        new UIComponent(
            'edit-mail-filter-dialog', '/kix-module-mail-filter$0/webapp/components/edit-mail-filter-dialog', []
        )
    ];

    public webDependencies: string[] = [
        './mail-filter/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
