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

    public id = 'oauth2-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('oauth2-component', '/kix-module-oauth2$0/webapp/core/OAuth2UIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'admin-oauth2-profiles', '/kix-module-oauth2$0/webapp/components/admin-oauth2-profiles', []
        ),
        new UIComponent(
            'renew-authorization-cell', '/kix-module-oauth2$0/webapp/components/renew-authorization-cell', []
        )
    ];

    public webDependencies: string[] = [
        './oauth2/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
