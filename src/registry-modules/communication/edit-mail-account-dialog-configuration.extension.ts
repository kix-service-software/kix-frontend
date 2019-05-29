import { IConfigurationExtension } from '../../core/extensions';
import { EditMailAccountDialogContext } from '../../core/browser/mail-account';
import {
    ConfiguredWidget, FormField, FormFieldValue, MailAccountProperty, Form,
    KIXObjectType, FormContext, ContextConfiguration, FormFieldOption, FormFieldOptions, InputFieldTypes,
    KIXObjectProperty
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditMailAccountDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-mail-account-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const group = new FormGroup('Translatable#Email Account', [
                new FormField(
                    'Translatable#User Name', MailAccountProperty.LOGIN, null, true,
                    'Translatable#Helptext_Admin_MailAccountEdit_UserName'
                ),
                new FormField(
                    'Translatable#Password', MailAccountProperty.PASSWORD, null, false,
                    'Translatable#Helptext_Admin_MailAccountEdit_Password',
                    [
                        new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                    ], null, null, null, null, null, null, null, null, null, null, null, null,
                    'Translatable#not modified'
                ),
                new FormField(
                    'Translatable#Host', MailAccountProperty.HOST, null, true,
                    'Translatable#Helptext_Admin_MailAccountEdit_Host'
                ),
                new FormField(
                    'Translatable#Type', MailAccountProperty.TYPE, 'mail-account-input-types',
                    true, 'Translatable#Helptext_Admin_MailAccountEdit_Type.'
                ),
                new FormField(
                    'Translatable#Accept KIX Header', MailAccountProperty.TRUSTED, 'checkbox-input', true,
                    'Translatable#Helptext_Admin_MailAccountEdit_AcceptKIXHeader', undefined,
                    new FormFieldValue(false)
                ),
                new FormField(
                    'Translatable#Dispatching', MailAccountProperty.DISPATCHING_BY, 'mail-account-input-dispatching',
                    true, 'Translatable#Helptext_Admin_MailAccountEdit_Dispachting', [
                        new FormFieldOption(FormFieldOptions.SHOW_INVALID, true)
                    ]
                ),
                new FormField(
                    'Translatable#Comment', MailAccountProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_MailAccountEdit_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_MailAccountEdit_Validity',
                    null, new FormFieldValue(1)
                )
            ]);

            const form = new Form(
                formId, 'Translatable#Edit Account', [group], KIXObjectType.MAIL_ACCOUNT, true, FormContext.EDIT
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.MAIL_ACCOUNT, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
