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

    public webDependencies: string[] = [
        './search/webapp'
    ];

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'search-module';

    public initComponents: UIComponent[] = [
        new UIComponent('search-module', '/kix-module-search$0/webapp/core/SearchUIModule', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('search', '/kix-module-search$0/webapp/components/search-module', []),
        new UIComponent(
            'save-search-template-overlay', '/kix-module-search$0/webapp/components/save-search-template-overlay', []
        )
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
