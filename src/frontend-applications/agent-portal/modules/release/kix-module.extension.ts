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

    public id = 'release-module';

    public initComponents: UIComponent[] = [
        new UIComponent('release-module', '/kix-module-release$0/webapp/core/ReleaseUIModule.ts', []),
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('welcome-slider-widget', '/kix-module-release$0/webapp/components/welcome-slider-widget', []),
        new UIComponent(
            'help-hints-tricks-widget', '/kix-module-release$0/webapp/components/help-hints-tricks-widget', []
        ),
        new UIComponent(
            'release-module', '/kix-module-release$0/webapp/components/release-module', []
        )
    ];

    public webDependencies: string[] = [
        './release/webapp'
    ];
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
