import { IConfigurationExtension } from '../../core/extensions';
import {
    ConfiguredWidget, FormField, FormFieldValue, Form, KIXObjectType, FormContext, ContextConfiguration,
    KIXObjectProperty, TextModuleProperty
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { NewTextModuleDialogContext } from '../../core/browser/text-modules';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTextModuleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-text-module-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const group = new FormGroup('Translatable#Text Module', [
                new FormField(
                    'Translatable#Name', TextModuleProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_TextModuleCreate_Name'
                ),
                new FormField(
                    'Translatable#Keywords', TextModuleProperty.KEYWORDS, null, false,
                    'Translatable#Helptext_Admin_TextModuleCreate_Keywords'
                ),
                new FormField(
                    'Translatable#Subject', TextModuleProperty.SUBJECT, null, false,
                    'Translatable#Helptext_Admin_TextModuleCreate_Subject'
                ),
                new FormField(
                    'Translatable#Text', TextModuleProperty.TEXT, 'rich-text-input', true,
                    'Translatable#Helptext_Admin_TextModuleCreate_Text'
                ),
                new FormField(
                    'Translatable#Language', TextModuleProperty.LANGUAGE, 'language-input', false,
                    'Translatable#Helptext_Admin_TextModuleCreate_Language'
                ),
                new FormField(
                    'Translatable#Comment', TextModuleProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_TextModuleCreate_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_TextModuleCreate_Validity',
                    null, new FormFieldValue(1)
                )
            ]);

            const form = new Form(formId, 'Translatable#New Text Module', [group], KIXObjectType.TEXT_MODULE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TEXT_MODULE, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
