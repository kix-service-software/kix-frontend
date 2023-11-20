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

    public id = 'object-search-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('object-search-component', '/kix-module-object-search$0/webapp/core/ObjectSearchUIModule', [])
    ];

    public uiComponents: UIComponent[] = [];

    public webDependencies: string[] = [
        './object-search/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
