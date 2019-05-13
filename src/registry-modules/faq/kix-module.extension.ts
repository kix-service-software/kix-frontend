import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public id = 'faq-module';

    public initComponents: UIComponent[] = [
        new UIComponent('faq-module-component', 'faq/faq-module-component', [])
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
        new UIComponent('faq-admin-categories', 'faq/admin/faq-admin-categories', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
