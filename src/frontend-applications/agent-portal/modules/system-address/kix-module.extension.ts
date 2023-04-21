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

    public id = 'system-address-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'system-address-component', '/kix-module-system-address$0/webapp/core/SystemAddressUIModule', []
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'admin-system-addresses', '/kix-module-system-address$0/webapp/components/admin-system-addresses', []
        ),
        new UIComponent(
            'system-address-info-widget',
            '/kix-module-system-address$0/webapp/components/system-address-info-widget', []
        )
    ];

    public webDependencies: string[] = [
        './system-address/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
