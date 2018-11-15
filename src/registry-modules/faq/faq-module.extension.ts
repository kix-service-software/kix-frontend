import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize,
    FormField, Form, FormContext, KIXObjectType
} from '@kix/core/dist/model';
import { FAQContext, FAQContextConfiguration } from '@kix/core/dist/browser/faq';
import { SearchProperty } from '@kix/core/dist/browser';
import { FAQArticleProperty } from '@kix/core/dist/model/kix/faq';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';
import { ConfigurationService } from '@kix/core/dist/services';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const articleListWidget =
            new ConfiguredWidget('20180727-faq-article-list-widget', new WidgetConfiguration(
                'faq-article-list-widget', 'Übersicht FAQ', [
                    'faq-article-create-action', 'csv-export-action'
                ], {},
                false, false, WidgetSize.BOTH, 'kix-icon-faq', true)
            );

        const content = ['20180727-faq-article-list-widget'];
        const contentWidgets = [articleListWidget];

        const faqCategoryExplorer =
            new ConfiguredWidget('20180625-faq-category-explorer', new WidgetConfiguration(
                'faq-category-explorer', 'FAQ Kategorien', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-faq', false)
            );

        const explorer = ['20180625-faq-category-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [faqCategoryExplorer];

        const notesSidebar =
            new ConfiguredWidget('20180726-faq-notes', new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20180726-faq-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new FAQContextConfiguration(
            this.getModuleId(), explorer, sidebars, sidebarWidgets, explorerWidgets, content, contentWidgets
        );
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();
        const linkFormId = 'link-faq-search-form';
        const existingLinkForm = configurationService.getModuleConfiguration(linkFormId, null);
        if (!existingLinkForm) {
            const fields: FormField[] = [];
            fields.push(new FormField("Volltext", SearchProperty.FULLTEXT, null, false, "Suche in folgenden  Feldern der FAQ-Artikel:  FAQ#,  Titel, Symptom, Ursache, Lösung, Kommentar, Geändert von, Erstellt von, Schlüsselworte, Sprache, Gültigkeit"));
            fields.push(new FormField("FAQ#", FAQArticleProperty.NUMBER, null, false, "Suche nach FAQ-Artikeln mit dieser Nummer oder Teilen der Nummer (mindestens 1 Zeichen)."));
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, null, false, "Suche nach FAQ-Artikeln mit diesem Titel oder Teilen des Titels (mindestens 1 Zeichen)."));
            fields.push(new FormField(
                "Kategorie", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', false, "Suche nach FAQ-Artikeln innerhalb der gewählten Kategorie.")
            );
            fields.push(new FormField("Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', false, "Suche nach FAQ-Artikeln mit der gewählten Gültigkeit."));

            const attributeGroup = new FormGroup('FAQ-Attribute', fields);

            const form = new Form(
                linkFormId, 'Verknüpfen mit FAQ', [attributeGroup],
                KIXObjectType.FAQ_ARTICLE, false, FormContext.LINK, null, true
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }

        configurationService.registerForm(
            [FormContext.LINK], KIXObjectType.FAQ_ARTICLE, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
