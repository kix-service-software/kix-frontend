import {
    ContextConfiguration, FormField, FormContext, KIXObjectType, Form, FormFieldValue
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { NewContactDialogContextConfiguration, NewContactDialogContext } from "@kix/core/dist/browser/contact";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";
import { FAQArticleProperty } from "@kix/core/dist/model/kix/faq";
import { NewFAQArticleDialogContext } from "@kix/core/dist/browser/faq";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewFAQArticleDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewContactDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'new-faq-article-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const fields: FormField[] = [];
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, true, "Titel"));
            fields.push(new FormField("Kategorie", FAQArticleProperty.CATEGORY_ID, true, "Kategorie"));
            fields.push(new FormField(
                "Sprache", FAQArticleProperty.LANGUAGE, true, "Sprache", null, new FormFieldValue('de')
            ));
            fields.push(new FormField("Schlagworte", FAQArticleProperty.KEYWORDS, false, "Schlagworte"));
            fields.push(new FormField(
                "Sichtbarkeit", FAQArticleProperty.VISIBILITY, true, "Sichtbarkeit",
                null, new FormFieldValue("internal")
            ));
            fields.push(new FormField("Anlagen", FAQArticleProperty.ATTACHMENTS, false, "Anlagen"));
            fields.push(new FormField("FAQ verknüpfen mit", FAQArticleProperty.LINK, false, "FAQ verknüpfen mit"));
            fields.push(new FormField("Symptom", FAQArticleProperty.FIELD_1, false, "Symptom"));
            fields.push(new FormField("Ursache", FAQArticleProperty.FIELD_2, false, "Ursache"));
            fields.push(new FormField("Lösung", FAQArticleProperty.FIELD_3, false, "Lösung"));
            fields.push(new FormField("Kommentar", FAQArticleProperty.FIELD_6, false, "Kommentar"));
            fields.push(new FormField(
                "Gültigkeit", FAQArticleProperty.VALID_ID, true, "Gültigkeit", null, new FormFieldValue(1)
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
            fields.push(new FormField("Volltext", FAQArticleProperty.FULLTEXT, false, "Volltext"));
            fields.push(new FormField("FAQ#", FAQArticleProperty.NUMBER, false, "FAQ#"));
            fields.push(new FormField("Titel", FAQArticleProperty.TITLE, false, "Titel"));
            fields.push(new FormField("Kategorie", FAQArticleProperty.CATEGORY_ID, false, "Kategorie"));
            fields.push(new FormField("Gültig", FAQArticleProperty.VALID_ID, false, "Gültig"));

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
