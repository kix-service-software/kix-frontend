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

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'new-faq-article-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const fields: FormField[] = [];
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, null, true, "Titel"));
            fields.push(new FormField(
                "Kategorie", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', true, "Kategorie")
            );
            fields.push(new FormField(
                "Sprache", FAQArticleProperty.LANGUAGE, 'language-input', true, "Sprache",
                null, new FormFieldValue('de')
            ));
            fields.push(new FormField("Schlagworte", FAQArticleProperty.KEYWORDS, null, false, "Schlagworte"));
            fields.push(new FormField(
                "Sichtbarkeit", FAQArticleProperty.VISIBILITY, 'faq-visibility-input', true, "Sichtbarkeit",
                null, new FormFieldValue("internal")
            ));
            fields.push(new FormField("Anlagen", FAQArticleProperty.ATTACHMENTS, 'attachment-input', false, "Anlagen"));
            fields.push(new FormField(
                "FAQ verknüpfen mit", FAQArticleProperty.LINK, 'link-input', false, "FAQ verknüpfen mit")
            );
            fields.push(new FormField("Symptom", FAQArticleProperty.FIELD_1, 'rich-text-input', false, "Symptom"));
            fields.push(new FormField("Ursache", FAQArticleProperty.FIELD_2, 'rich-text-input', false, "Ursache"));
            fields.push(new FormField("Lösung", FAQArticleProperty.FIELD_3, 'rich-text-input', false, "Lösung"));
            fields.push(new FormField("Kommentar", FAQArticleProperty.FIELD_6, 'rich-text-input', false, "Kommentar"));
            fields.push(new FormField(
                "Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', true, "Gültigkeit",
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
            fields.push(new FormField("Volltext", FAQArticleProperty.FULLTEXT, null, false, "Volltext"));
            fields.push(new FormField("FAQ#", FAQArticleProperty.NUMBER, null, false, "FAQ#"));
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, null, false, "Titel"));
            fields.push(new FormField(
                "Kategorie", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', false, "Kategorie")
            );
            fields.push(new FormField("Gültigkeit", FAQArticleProperty.VALID_ID, 'valid-input', false, "Gültigkeit"));

            const group = new FormGroup('FAQ-Attribute', fields);

            const form = new Form(linkFormId, 'Verknüpfen mit FAQ', [group], KIXObjectType.FAQ_ARTICLE, false);
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
