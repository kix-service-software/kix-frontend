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

    public id = 'graph-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'graph-init-component', '/kix-module-graph$0/webapp/core/GraphUIModule', []
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('graph-explorer', '/kix-module-graph$0/webapp/components/graph-explorer', []),
        new UIComponent('graph-widget', '/kix-module-graph$0/webapp/components/graph-widget', []),
        new UIComponent('graph-module', '/kix-module-graph$0/webapp/components/graph-module', [])
    ];

    public webDependencies: string[] = [
        './graph/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
