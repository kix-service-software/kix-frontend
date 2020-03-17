/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";
import { UIComponent } from "../../model/UIComponent";

class Extension implements IKIXModuleExtension {

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
        ),
        new UIComponent(
            'new-translation-dialog', '/kix-module-translation$0/webapp/components/new-translation-dialog', []
        ),
        new UIComponent(
            'edit-translation-dialog', '/kix-module-translation$0/webapp/components/edit-translation-dialog', []
        )
    ];

    public webDependencies: string[] = [
        './translation/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
