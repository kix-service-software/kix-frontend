import {
    ContextConfiguration, FormField, FormContext, KIXObjectType, Form, FormFieldValue
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { FAQArticleProperty } from '../../core/model/kix/faq';
import { NewFAQArticleDialogContext, NewFAQArticleDialogContextConfiguration } from '../../core/browser/faq';
import { ConfigurationService } from '../../core/services';

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
            fields.push(new FormField('Translatable#Title', FAQArticleProperty.TITLE, null, true, 'Translatable#Insert a name for the FAQ article.'));
            fields.push(new FormField(
                'Translatable#Category', FAQArticleProperty.CATEGORY_ID, 'faq-category-input', true, 'Translatable#Select an FAQ category.')
            );
            fields.push(new FormField(
                'Translatable#Language', FAQArticleProperty.LANGUAGE, 'language-input', true, 'Translatable#Select a language for this FAQ article.',
                null, new FormFieldValue('de')
            ));
            fields.push(new FormField('Translatable#Tags', FAQArticleProperty.KEYWORDS, null, false, 'Translatable#Insert key words for the FAQ article to find them more quickly.'));
            fields.push(new FormField(
                'Translatable#Visibility', FAQArticleProperty.VISIBILITY, 'faq-visibility-input', true, 'Translatable#Define where this FAQ article will be shown (internal= only Agent Portal, external = KIX Agent and Customer Portal for authenticated users only, public=KIX Agent- and Customer Portal for both, authenticated and unauthenticated users).',
                null, new FormFieldValue('internal')
            ));
            fields.push(new FormField('Translatable#Attachments', FAQArticleProperty.ATTACHMENTS, 'attachment-input', false, 'Translatable#Attach additional files to the FAQ article. Drag & Drop is possible. Max. file size is 25 MB.'));
            fields.push(new FormField(
                'Link FAQ with', FAQArticleProperty.LINK, 'link-input', false, 'Translatable#Link this FAQ article to a ticket, a config item or another FAQ article.')
            );
            fields.push(new FormField('Translatable#Symptom', FAQArticleProperty.FIELD_1, 'rich-text-input', false, 'Translatable#Describe sympton as precisely as possible'));
            fields.push(new FormField('Translatable#Cause', FAQArticleProperty.FIELD_2, 'rich-text-input', false, 'Translatable#Please describe the reason as detailed as possible.'));
            fields.push(new FormField('Translatable#Solution', FAQArticleProperty.FIELD_3, 'rich-text-input', false, 'Translatable#Describe the solution for the symptons reasons as precisely as possible'));
            fields.push(new FormField('Translatable#Comment', FAQArticleProperty.FIELD_6, 'rich-text-input', false, 'Translatable#Insert additional information for this FAQ article.'));
            fields.push(new FormField(
                'Translatable#validity', FAQArticleProperty.VALID_ID, 'valid-input', true, 'Translatable#Set the FAQ article as „valid“, „invalid (temporarily)“, or „invalid“.',
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Translatable#FAQ Data', fields);

            const form = new Form(formId, 'Translatable#New FAQ', [group], KIXObjectType.FAQ_ARTICLE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.FAQ_ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
