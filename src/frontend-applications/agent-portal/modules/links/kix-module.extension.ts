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

    public id = 'links-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('links-component', '/kix-module-links$0/webapp/core/LinkUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('link-object-dialog', '/kix-module-links$0/webapp/components/link-object-dialog', []),
        new UIComponent('link-input', '/kix-module-links$0/webapp/components/link-input', []),
        new UIComponent('linked-objects-widget', '/kix-module-links$0/webapp/components/linked-objects-widget', []),
        new UIComponent(
            'edit-linked-objects-dialog', '/kix-module-links$0/webapp/components/edit-linked-objects-dialog', []
        )
    ];

    public webDependencies: string[] = [
        './links/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
