import {
    FormFieldOption, ContextConfiguration, FormField, Form, KIXObjectType, FormContext, FormFieldOptions
} from '../../core/model';
import { FAQCategoryProperty } from '../../core/model/kix/faq';
import { IConfigurationExtension } from '../../core/extensions';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { EditFAQCategoryDialogContext } from '../../core/browser/faq/admin';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditFAQCategoryDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-faq-category-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const fields: FormField[] = [];
            fields.push(
                new FormField(
                    'Translatable#Name', FAQCategoryProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_FAQCategoryEdit_Name'
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Icon', 'ICON', 'icon-input', false,
                    'Translatable#Helptext_Admin_FAQCategoryEdit_Icon'
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Parent Category', FAQCategoryProperty.PARENT_ID, 'faq-category-input', false,
                    'Translatable#Helptext_Admin_FAQCategoryEdit_ParentCategory', [
                        new FormFieldOption(FormFieldOptions.SHOW_INVALID, true)
                    ]
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Comment', FAQCategoryProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_FAQCategoryEdit_Comment',
                    null, null, null, null, null, null, null, 250
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Validity', FAQCategoryProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_FAQCategoryEdit_Validity'
                )
            );

            const group = new FormGroup('Translatable#FAQ Category Information', fields);

            const form = new Form(
                formId, 'Translatable#Edit FAQ Category', [group], KIXObjectType.FAQ_CATEGORY, true, FormContext.EDIT
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.FAQ_CATEGORY, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
