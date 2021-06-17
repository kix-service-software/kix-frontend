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

import { UIComponentPermission } from '../../model/UIComponentPermission';

import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'faq-module';

    public external: boolean = false;

    public webDependencies: string[] = [
        './faq/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('faq-read-module-component', '/kix-module-faq$0/webapp/core/ui-modules/FAQReadUIModule', [
            new UIComponentPermission('faq/articles', [CRUD.READ])
        ]),
        new UIComponent('faq-edit-module-component', '/kix-module-faq$0/webapp/core/ui-modules/FAQEditUIModule', [
            new UIComponentPermission('faq/articles', [CRUD.CREATE])
        ]),
        new UIComponent('faq-admin-module-component', '/kix-module-faq$0/webapp/core/ui-modules/FAQAdminUIModule', [
            new UIComponentPermission('system/faq/categories', [CRUD.CREATE], true)
        ]),
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('faq', '/kix-module-faq$0/webapp/components/faq-module', []),
        new UIComponent('faq-vote-selector', '/kix-module-faq$0/webapp/components/faq-vote-selector', []),
        new UIComponent(
            'faq-article-content-widget', '/kix-module-faq$0/webapp/components/widgets/faq-article-content-widget', []
        ),
        new UIComponent(
            'faq-article-history-widget', '/kix-module-faq$0/webapp/components/widgets/faq-article-history-widget', []
        ),
        new UIComponent(
            'faq-article-list-widget', '/kix-module-faq$0/webapp/components/widgets/faq-article-list-widget', []),
        new UIComponent(
            'faq-category-explorer', '/kix-module-faq$0/webapp/components/widgets/faq-category-explorer', []
        ),
        new UIComponent('faq-admin-categories', '/kix-module-faq$0/webapp/components/admin/faq-admin-categories', []),
        new UIComponent(
            'faq-category-info-widget', '/kix-module-faq$0/webapp/components/admin/widgets/faq-category-info-widget', []
        ),
        new UIComponent(
            'faq-article-import-cell', '/kix-module-faq$0/webapp/components/faq-article-import-cell', []
        ),
        new UIComponent(
            'faq-article-html-preview-cell', '/kix-module-faq$0/webapp/components/faq-article-html-preview-cell', []
        )
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
