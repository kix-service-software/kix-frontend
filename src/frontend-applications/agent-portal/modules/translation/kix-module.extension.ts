/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public id = 'translation-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('translation-component', '/kix-module-translation$0/webapp/core/TranslationUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'i18n-admin-translations', '/kix-module-translation$0/webapp/components/i18n-admin-translations', []
        )
    ];

    public webDependencies: string[] = [
        './translation/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
