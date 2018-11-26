import {
    ContextConfiguration, FormField, FormContext, KIXObjectType, Form, FormFieldValue
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";
import { FAQArticleProperty } from "@kix/core/dist/model/kix/faq";
import { EditFAQArticleDialogContext, EditFAQArticleDialogContextConfiguration } from "@kix/core/dist/browser/faq";
import { ConfigurationService } from "@kix/core/dist/services";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return EditFAQArticleDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new EditFAQArticleDialogContextConfiguration();
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-faq-article-form';
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
            fields.push(new FormField("Symptom", FAQArticleProperty.FIELD_1, 'rich-text-input', false, "Beschreiben Sie das Symptom so genau wie möglich."));
            fields.push(new FormField("Ursache", FAQArticleProperty.FIELD_2, 'rich-text-input', false, "Beschreiben Sie die Ursache so genau wie möglich."));
            fields.push(new FormField("Lösung", FAQArticleProperty.FIELD_3, 'rich-text-input', false, "Beschreiben Sie die Lösung für die Ursache des Symptoms so genau wie möglich."));
            fields.push(new FormField("Kommentar", FAQArticleProperty.FIELD_6, 'rich-text-input', false, "Geben Sie zusätzliche Informationen zu diesem FAQ-Artikel an."));
            fields.push(new FormField(
                "Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', true, "Legen Sie fest, ob der FAQ-Artikel „gültig“, „ungültig“ oder „temporär ungültig“ ist.",
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('FAQ Daten', fields);

            const form = new Form(formId, 'FAQ Eintrag Bearbeiten', [group], KIXObjectType.FAQ_ARTICLE, true, FormContext.EDIT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.FAQ_ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
