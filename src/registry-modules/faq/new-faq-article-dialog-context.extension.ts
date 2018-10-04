import {
    ContextConfiguration, FormField, FormContext, KIXObjectType, Form, FormFieldValue
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";
import { FAQArticleProperty } from "@kix/core/dist/model/kix/faq";
import { NewFAQArticleDialogContext, NewFAQArticleDialogContextConfiguration } from "@kix/core/dist/browser/faq";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewFAQArticleDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewFAQArticleDialogContextConfiguration();
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'new-faq-article-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const fields: FormField[] = [];
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, null, true, "Geben Sie einen Titel für den FAQ-Eintrag ein. (Pflichtfeld)"));
            fields.push(new FormField(
                "Kategorie", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', true, "Wählen Sie eine FAQ-Kategorie aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Pflichtfeld)")
            );
            fields.push(new FormField(
                "Sprache", FAQArticleProperty.LANGUAGE, 'language-input', true, "Wählen Sie die Sprache des FAQ-Eintrages aus der Liste. (Pflichtfeld)",
                null, new FormFieldValue('de')
            ));
            fields.push(new FormField("Schlagworte", FAQArticleProperty.KEYWORDS, null, false, "Geben Sie Schlagwörter für den FAQ-Artikel ein. (Optional)"));
            fields.push(new FormField(
                "Sichtbarkeit", FAQArticleProperty.VISIBILITY, 'faq-visibility-input', true, "Legen Sie die Sichtbarkeit des FAQ-Artikels fest (intern, extern, öffentlich).",
                null, new FormFieldValue("internal")
            ));
            fields.push(new FormField("Anlagen", FAQArticleProperty.ATTACHMENTS, 'attachment-input', false, "Wählen Sie hier ggf. Dateien (Dateigröße maximal 25 MB pro Datei) aus, die Sie an das Ticket anhängen möchten. Einfügen per Drag & Drop ist möglich. "));
            fields.push(new FormField(
                "FAQ verknüpfen mit", FAQArticleProperty.LINK, 'link-input', false, "Verknüpfen Sie den FAQ-Artikel mit einem Ticket, einem anderen FAQ-Artikel oder einem Config Item.  (Optional)")
            );
            fields.push(new FormField("Symptom", FAQArticleProperty.FIELD_1, 'rich-text-input', false, "Beschreiben Sie das Symptom so genau wie möglich. (Optional)"));
            fields.push(new FormField("Ursache", FAQArticleProperty.FIELD_2, 'rich-text-input', false, "Beschreiben Sie die Ursache so genau wie möglich. (Optional)"));
            fields.push(new FormField("Lösung", FAQArticleProperty.FIELD_3, 'rich-text-input', false, "Beschreiben Sie die Lösung für die Ursache des Symptoms so genau wie mölich. (Optional)"));
            fields.push(new FormField("Kommentar", FAQArticleProperty.FIELD_6, 'rich-text-input', false, "Geben Sie zusätzliche Informationen zu diesem FAQ-Artikel an. (Optional)"));
            fields.push(new FormField(
                "Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', true, "Legen Sie fest, ob der FAQ-Artikel „gültig“, „ungültig“ oder „temporär ungültig“ ist. (Pflichtfeld)",
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('FAQ Daten', fields);

            const form = new Form(formId, 'Neue FAQ', [group], KIXObjectType.FAQ_ARTICLE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.FAQ_ARTICLE, formId);

        const linkFormId = 'link-faq-search-form';
        const existingLinkForm = configurationService.getModuleConfiguration(linkFormId, null);
        if (!existingLinkForm) {
            const fields: FormField[] = [];
            fields.push(new FormField("Volltext", FAQArticleProperty.FULLTEXT, null, false, "Geben Sie einen Begriff ein und suchen Sie nach FAQ-Artikeln mit diesem Begriff. Die Suche nach dem Begriff wird in den Feldern „Approved“, „Ceändert von“ ,  „ContentType“ , „Erstellt von“ , „Symptom“, „Ursache“ , „Lösung“ , „Kommentar“ , „Schlüsselworte“ , „Sprache“ , „Titel“ , „FAQ#“ , „Gültigkeit“ , „Sichtbarkeit.“"));
            fields.push(new FormField("FAQ#", FAQArticleProperty.NUMBER, null, false, "Geben Sie eine Nummer oder Teile der Nummer (mindestens 1 Zeichen) eines  FAQ-Artikels  ein und suchen Sie nach FAQ-Artikeln mit dieser Nummer oder Teilen der Nummer."));
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, null, false, "Geben Sie einen Titel oder Teile des Titels ein (mindestens 1 Zeichen) und suchen Sie nach FAQ-Artikeln mit diesem Titel oder Teilen des Titels."));
            fields.push(new FormField(
                "Kategorie", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', false, "Wählen Sie eine Kategorie aus der Liste und suchen Sie nach FAQ-Artikeln innerhalb der gewählten Kategorie.")
            );
            fields.push(new FormField("Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', false, "Wählen Sie in der Liste „gültig“ / „ungültig“ oder „temporär ungültig“ und suchen Sie nach FAQ-Artikeln mit der gewählten Gültigkeit."));

            const group = new FormGroup('FAQ-Attribute', fields);

            const form = new Form(
                linkFormId, 'Verknüpfen mit FAQ', [group],
                KIXObjectType.FAQ_ARTICLE, false, FormContext.LINK
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }

        configurationService.registerForm(
            [FormContext.LINK], KIXObjectType.FAQ_ARTICLE, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
