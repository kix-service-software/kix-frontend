import { IConfigurationExtension } from '../../core/extensions';
import { NewSystemAddressDialogContext } from '../../core/browser/system-address/context/system-address';
import {
    ConfiguredWidget, FormField, FormFieldValue, SystemAddressProperty, Form,
    KIXObjectType, FormContext, ContextConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { FormValidationService } from '../../core/browser';

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
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [
                new FormField(
                    'Translatable#Email Address', SystemAddressProperty.NAME, null, true,
                    '', null, null, null, null, null, null, null, null,
                    FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                ),
                new FormField(
                    'Translatable#Displayname', SystemAddressProperty.REALNAME, null, true,
                    ''
                ),
                new FormField(
                    'Translatable#Comment', SystemAddressProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Insert a comment for the system address.', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', SystemAddressProperty.VALID_ID, 'valid-input', true,
                    "Translatable#Set the system address as „valid“, „invalid (temporarily)“, or „invalid“.",
                    null, new FormFieldValue(1)
                )
            ];

            const group = new FormGroup('Translatable#System Adresses', fields);

            const form = new Form(formId, 'Translatable#New Address', [group], KIXObjectType.SYSTEM_ADDRESS);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.SYSTEM_ADDRESS, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
