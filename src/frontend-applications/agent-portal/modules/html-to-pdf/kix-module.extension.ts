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

    public id = 'html-to-pdf-module';

    public initComponents: UIComponent[] = [
        new UIComponent('html-to-pdf-component', '/html-to-pdf$0/webapp/core/HTMLToPDFUIModule', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [];

    public webDependencies: string[] = [
        './html-to-pdf/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
