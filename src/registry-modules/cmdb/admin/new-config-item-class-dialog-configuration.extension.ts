
import {
    ContextConfiguration, FormField, ConfigItemClassProperty, FormFieldValue, Form,
    KIXObjectType, FormContext, ConfiguredWidget
} from '../../../core/model';
import { IConfigurationExtension } from '../../../core/extensions';
import { ConfigurationService } from '../../../core/services';
import {
    NewConfigItemClassDialogContext, NewConfigItemClassDialogContextConfiguration
} from '../../../core/browser/cmdb';
import { FormGroup } from '../../../core/model/components/form/FormGroup';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemClassDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new NewConfigItemClassDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-config-item-class-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing || overwrite) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Name', ConfigItemClassProperty.NAME, null, true,
                'Translatable#Insert a config item class name.'
            ));
            fields.push(new FormField(
                'Translatable#Icon', ConfigItemClassProperty.ICON, 'icon-input', false,
                'Translatable#Select an icon for this config item class.'
            ));
            fields.push(new FormField(
                'Translatable#Class Definition', ConfigItemClassProperty.DEFINITION_STRING, 'text-area-input', true,
                'Translatable#Insert the definition for the Config Item Class.',
                null, null, null, null, null, null, null
            ));
            fields.push(new FormField(
                'Translatable#Comment', ConfigItemClassProperty.COMMENT, 'text-area-input', false,
                'Translatable#Insert a comment for the CI class.',
                null, null, null, null, null, null, null, 200
            ));
            fields.push(new FormField(
                'Translatable#validity', ConfigItemClassProperty.VALID_ID, 'valid-input', true,
                'Translatable#Set the cmdb class as „valid“, „invalid (temporarily)“, or „invalid“.',
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Translatable#CMDB Class Definition Data', fields);

            const form = new Form(formId, 'Translatable#Add CMDB Class', [group], KIXObjectType.CONFIG_ITEM_CLASS);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM_CLASS, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
