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

import { UIComponentPermission } from "../../model/UIComponentPermission";

import { CRUD } from "../../../../server/model/rest/CRUD";

class Extension implements IKIXModuleExtension {

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
            new UIComponentPermission('faq/articles', [CRUD.CREATE]),
            new UIComponentPermission('faq/articles/*', [CRUD.UPDATE])
        ]),
        new UIComponent('faq-admin-module-component', '/kix-module-faq$0/webapp/core/ui-modules/FAQAdminUIModule', [
            new UIComponentPermission('system/faq/categories', [CRUD.CREATE], true),
            new UIComponentPermission('system/faq/categories/*', [CRUD.UPDATE], true)
        ]),
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('faq', '/kix-module-faq$0/webapp/components/faq-module', []),
        new UIComponent('faq-vote-selector', '/kix-module-faq$0/webapp/components/faq-vote-selector', []),
        new UIComponent(
            'new-faq-article-dialog', '/kix-module-faq$0/webapp/components/dialogs/new-faq-article-dialog', []
        ),
        new UIComponent(
            'edit-faq-article-dialog', '/kix-module-faq$0/webapp/components/dialogs/edit-faq-article-dialog', []
        ),
        new UIComponent(
            'search-faq-article-dialog', '/kix-module-faq$0/webapp/components/dialogs/search-faq-article-dialog', []
        ),
        new UIComponent(
            'faq-article-info-widget', '/kix-module-faq$0/webapp/components/widgets/faq-article-info-widget', []
        ),
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
            'new-faq-category-dialog', '/kix-module-faq$0/webapp/components/admin/dialogs/new-faq-category-dialog', []
        ),
        new UIComponent(
            'edit-faq-category-dialog', '/kix-module-faq$0/webapp/components/admin/dialogs/edit-faq-category-dialog', []
        ),
        new UIComponent(
            'faq-category-info-widget', '/kix-module-faq$0/webapp/components/admin/widgets/faq-category-info-widget', []
        )
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
