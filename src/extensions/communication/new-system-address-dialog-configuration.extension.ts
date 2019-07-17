import { IConfigurationExtension } from '../../core/extensions';
import { NewSystemAddressDialogContext } from '../../core/browser/system-address/context';
import {
    ConfiguredWidget, FormField, FormFieldValue, SystemAddressProperty, Form,
    KIXObjectType, FormContext, ContextConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { FormValidationService } from '../../core/browser/form/validation';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewSystemAddressDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-system-address-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const fields: FormField[] = [
                new FormField(
                    'Translatable#Email Address', SystemAddressProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_SystemAddressCreate_Name', null, null, null, null, null,
                    null, null, null, FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                ),
                new FormField(
                    'Translatable#Display Name', SystemAddressProperty.REALNAME, null, true,
                    'Translatable#Helptext_Admin_SystemAddressCreate_DisplayName'
                ),
                new FormField(
                    'Translatable#Comment', SystemAddressProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_SystemAddressCreate_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', SystemAddressProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_SystemAddressCreate_Validity',
                    null, new FormFieldValue(1)
                )
            ];

            const group = new FormGroup('Translatable#System Addresses', fields);

            const form = new Form(formId, 'Translatable#New Address', [group], KIXObjectType.SYSTEM_ADDRESS);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.SYSTEM_ADDRESS, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
