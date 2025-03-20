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

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'valid-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('valid-component', '/kix-module-valid$0/webapp/core/ValidUIModule', [])
    ];

    public uiComponents: UIComponent[] = [];

    public webDependencies: string[] = [
        './valid/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
