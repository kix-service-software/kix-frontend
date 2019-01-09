import {
    ContextConfiguration, FormField, FormContext, KIXObjectType, Form, FormFieldValue
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { FormGroup } from "../../core/model/components/form/FormGroup";
import { FAQArticleProperty } from "../../core/model/kix/faq";
import { NewFAQArticleDialogContext, NewFAQArticleDialogContextConfiguration } from "../../core/browser/faq";
import { ConfigurationService } from "../../core/services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewFAQArticleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new NewFAQArticleDialogContextConfiguration();
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-faq-article-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
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
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
