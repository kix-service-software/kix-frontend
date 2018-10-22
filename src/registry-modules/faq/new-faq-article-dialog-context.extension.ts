import {
    ContextConfiguration, FormField, FormContext, KIXObjectType, Form, FormFieldValue
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";
import { FAQArticleProperty } from "@kix/core/dist/model/kix/faq";
import { NewFAQArticleDialogContext, NewFAQArticleDialogContextConfiguration } from "@kix/core/dist/browser/faq";
import { SearchProperty } from "@kix/core/dist/browser";

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
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, null, true, "Geben Sie einen Titel / Bezeichnung für den FAQ-Eintrag ein."));
            fields.push(new FormField(
                "Kategorie", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', true, "Wählen Sie eine FAQ-Kategorie aus der Liste.")
            );
            fields.push(new FormField(
                "Sprache", FAQArticleProperty.LANGUAGE, 'language-input', true, "Wählen Sie die Sprache des FAQ-Eintrages aus der Liste.",
                null, new FormFieldValue('de')
            ));
            fields.push(new FormField("Schlagworte", FAQArticleProperty.KEYWORDS, null, false, "Geben Sie Schlagwörter für den FAQ-Artikel ein. Schlagworte unterstützen u.a. das schnelle Auffinden von FAQ-Einträgen."));
            fields.push(new FormField(
                "Sichtbarkeit", FAQArticleProperty.VISIBILITY, 'faq-visibility-input', true, "Legen Sie fest, wo der FAQ-Artikel angezeigt werden darf. (intern = nur im KIX Agentenportal, extern = KIX Agentenportal  und KIX Kundenportal, öffentlich = KIX Agentenportal  und KIX Kundenportal sowie außerhalb von KIX).",
                null, new FormFieldValue("internal")
            ));
            fields.push(new FormField("Anlagen", FAQArticleProperty.ATTACHMENTS, 'attachment-input', false, "Hier können Sie zusätzliche Dateien an den FAQ-Artikel anhängen. Ein Einfügen per Drag & Drop ist möglich. Bitte beachten Sie die maximale Dateigröße von 25 MB  pro Datei."));
            fields.push(new FormField(
                "FAQ verknüpfen mit", FAQArticleProperty.LINK, 'link-input', false, "Verknüpfen Sie den FAQ-Artikel mit einem Ticket, einem anderen FAQ-Artikel oder einem Config Item.")
            );
            fields.push(new FormField("Symptom", FAQArticleProperty.FIELD_1, 'rich-text-input', false, "Beschreiben Sie das Symptom so genau wie möglich."));
            fields.push(new FormField("Ursache", FAQArticleProperty.FIELD_2, 'rich-text-input', false, "Beschreiben Sie die Ursache so genau wie möglich."));
            fields.push(new FormField("Lösung", FAQArticleProperty.FIELD_3, 'rich-text-input', false, "Beschreiben Sie die Lösung für die Ursache des Symptoms so genau wie möglich."));
            fields.push(new FormField("Kommentar", FAQArticleProperty.FIELD_6, 'rich-text-input', false, "Geben Sie zusätzliche Informationen zu diesem FAQ-Artikel an."));
            fields.push(new FormField(
                "Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', true, "Legen Sie fest, ob der FAQ-Artikel „gültig“, „ungültig“ oder „temporär ungültig“ ist.",
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
            const fulltextFields = [
                new FormField("Volltext", SearchProperty.FULLTEXT, null, false, "Suche in folgenden  Feldern der FAQ-Artikel:  FAQ#,  Titel, Symptom, Ursache, Lösung, Kommentar, Geändert von, Erstellt von, Schlüsselworte, Sprache, Gültigkeit")
            ];

            const fields: FormField[] = [];
            fields.push(new FormField("FAQ#", FAQArticleProperty.NUMBER, null, false, "Suche nach FAQ-Artikeln mit dieser Nummer oder Teilen der Nummer (mindestens 1 Zeichen)."));
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, null, false, "Suche nach FAQ-Artikeln mit diesem Titel oder Teilen des Titels (mindestens 1 Zeichen)."));
            fields.push(new FormField(
                "Kategorie", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', false, "Suche nach FAQ-Artikeln innerhalb der gewählten Kategorie.")
            );
            fields.push(new FormField("Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', false, "Suche nach FAQ-Artikeln mit der gewählten Gültigkeit."));

            const fulltextGroup = new FormGroup('Volltext', fulltextFields, 'Oder');
            const attributeGroup = new FormGroup('FAQ-Attribute', fields);

            const form = new Form(
                linkFormId, 'Verknüpfen mit FAQ', [fulltextGroup, attributeGroup],
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
    return new Extension();
};
