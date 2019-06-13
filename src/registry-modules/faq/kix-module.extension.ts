import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'faq-module';

    public initComponents: UIComponent[] = [
        new UIComponent('faq-read-module-component', 'faq/module/faq-read-module-component', [
            new UIComponentPermission('faq/articles', [CRUD.READ])
        ]),
        new UIComponent('faq-edit-module-component', 'faq/module/faq-edit-module-component', [
            new UIComponentPermission('faq/articles', [CRUD.CREATE]),
            new UIComponentPermission('faq/articles/*', [CRUD.UPDATE])
        ]),
        new UIComponent('faq-admin-module-component', 'faq/module/faq-admin-module-component', [
            new UIComponentPermission('system/faq/categories', [CRUD.CREATE], true),
            new UIComponentPermission('system/faq/categories/*', [CRUD.UPDATE], true)
        ]),
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('faq', 'faq/faq-module', []),
        new UIComponent('faq-vote-selector', 'faq/faq-vote-selector', []),
        new UIComponent('new-faq-article-dialog', 'faq/dialogs/new-faq-article-dialog', []),
        new UIComponent('edit-faq-article-dialog', 'faq/dialogs/edit-faq-article-dialog', []),
        new UIComponent('search-faq-article-dialog', 'faq/dialogs/search-faq-article-dialog', []),
        new UIComponent('faq-category-input', 'faq/dialogs/inputs/faq-category-input', []),
        new UIComponent('faq-visibility-input', 'faq/dialogs/inputs/faq-visibility-input', []),
        new UIComponent('faq-article-info-widget', 'faq/widgets/faq-article-info-widget', []),
        new UIComponent('faq-article-content-widget', 'faq/widgets/faq-article-content-widget', []),
        new UIComponent('faq-article-history-widget', 'faq/widgets/faq-article-history-widget', []),
        new UIComponent('faq-article-list-widget', 'faq/widgets/faq-article-list-widget', []),
        new UIComponent('faq-category-explorer', 'faq/widgets/faq-category-explorer', []),
        new UIComponent('faq-admin-categories', 'faq/admin/faq-admin-categories', []),
        new UIComponent('new-faq-category-dialog', 'faq/admin/dialogs/new-faq-category-dialog', []),
        new UIComponent('edit-faq-category-dialog', 'faq/admin/dialogs/edit-faq-category-dialog', []),
        new UIComponent('faq-category-info-widget', 'faq/admin/widgets/faq-category-info-widget', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
