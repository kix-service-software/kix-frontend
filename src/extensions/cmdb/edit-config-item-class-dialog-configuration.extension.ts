/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import {
    ContextConfiguration, FormField, ConfigItemClassProperty, FormFieldValue, Form,
    KIXObjectType, FormContext, ConfiguredWidget, FormFieldOption, ObjectReferenceOptions, KIXObjectProperty
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import { ConfigurationService } from '../../core/services';
import { EditConfigItemClassDialogContext } from '../../core/browser/cmdb';
import { FormGroup } from '../../core/model/components/form/FormGroup';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditConfigItemClassDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-config-item-class-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing || overwrite) {
            const infoGroup = new FormGroup('Translatable#CI Class Information', [
                new FormField(
                    'Translatable#Name', ConfigItemClassProperty.NAME, null, true,
                    'Translatable#Helptext_CMDB_ConfigItemClassEdit_Name'
                ),
                new FormField(
                    'Translatable#Icon', ConfigItemClassProperty.ICON, 'icon-input', false,
                    'Translatable#Helptext_CMDB_ConfigItemClassEdit_Icon'
                ),
                new FormField(
                    'Translatable#Class Definition', ConfigItemClassProperty.DEFINITION_STRING, 'text-area-input', true,
                    'Translatable#Helptext_CMDB_ConfigItemClassEdit_Definition',
                    null, null, null, null, null, null, null
                ),
                new FormField(
                    'Translatable#Comment', ConfigItemClassProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_CMDB_ConfigItemClassEdit_Comment',
                    null, null, null, null, null, null, null, 200
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID,
                    'object-reference-input', true, 'Translatable#Helptext_CMDB_ConfigItemClassEdit_Valid', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                    ]
                )
            ]);

            const objectPermissionGroup = new FormGroup('Translatable#Permissions', [
                new FormField(
                    null, 'OBJECT_PERMISSION', 'assign-role-permission-input', false, null
                )
            ]);

            const dependentObjectPermissionGroup = new FormGroup('Translatable#Permissions on dependent objects', [
                new FormField(
                    null, 'PROPERTY_VALUE_PERMISSION', 'assign-role-permission-input', false, null, [
                        new FormFieldOption('FOR_PROPERTY_VALUE_PERMISSION', true),
                    ]
                )
            ]);

            const form = new Form(formId, 'Translatable#Edit Class', [
                infoGroup,
                // objectPermissionGroup,
                // dependentObjectPermissionGroup
            ], KIXObjectType.CONFIG_ITEM_CLASS, true, FormContext.EDIT);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.CONFIG_ITEM_CLASS, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
