
import {
    ContextConfiguration, FormField, ConfigItemClassProperty, FormFieldValue, Form,
    KIXObjectType, FormContext, ConfiguredWidget, FormFieldOption
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
            const infoGroup = new FormGroup('Translatable#CI Class Information', [
                new FormField(
                    'Translatable#Name', ConfigItemClassProperty.NAME, null, true,
                    'Translatable#Insert a config item class name.'
                ),
                new FormField(
                    'Translatable#Icon', ConfigItemClassProperty.ICON, 'icon-input', false,
                    'Translatable#Select an icon for this config item class.'
                ),
                new FormField(
                    'Translatable#Class Definition', ConfigItemClassProperty.DEFINITION_STRING, 'text-area-input', true,
                    'Translatable#Insert the definition for the Config Item Class.',
                    null, null, null, null, null, null, null
                ),
                new FormField(
                    'Translatable#Comment', ConfigItemClassProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Insert a comment for the CI class.',
                    null, null, null, null, null, null, null, 200
                ),
                new FormField(
                    'Translatable#Validity', ConfigItemClassProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Set the ci class as „valid“, „invalid (temporarily)“, or „invalid“.',
                    null, new FormFieldValue(1)
                )
            ]);

            const objectPermissionGroup = new FormGroup('Translatable#Object permissions', [
                new FormField(
                    null, 'OBJECT_PERMISSION', 'assign-role-permission-input', false, null
                )
            ]);

            const dependentObjectPermissionGroup = new FormGroup('Translatable#Permissions on dependent objects', [
                new FormField(
                    null, 'DEPENDENT_OBJECT_PERMISSION', 'assign-role-permission-input', false, null, [
                        new FormFieldOption('REQUIRED', true),
                    ]
                )
            ]);

            const form = new Form(formId, 'Translatable#Add CI Class', [
                infoGroup,
                objectPermissionGroup,
                dependentObjectPermissionGroup
            ], KIXObjectType.CONFIG_ITEM_CLASS);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM_CLASS, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
