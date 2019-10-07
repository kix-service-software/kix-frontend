/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ConfiguredWidget, FormField, FormFieldValue, Form, KIXObjectType, FormContext, ContextConfiguration,
    KIXObjectProperty,
    SysConfigOptionDefinitionProperty,
    FormFieldOption,
    ObjectReferenceOptions
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { EditSysConfigDialogContext } from '../../core/browser/sysconfig';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditSysConfigDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-sysconfig-form';
        const existing = configurationService.getConfiguration(formId);

        if (!existing) {
            const group = new FormGroup('Translatable#SysConfig', [
                new FormField(
                    'Translatable#Name', SysConfigOptionDefinitionProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_SysConfigEdit_Name', null, null, null, null,
                    null, null, null, null, null, null, false, false, true
                ),
                new FormField(
                    'Translatable#Description', SysConfigOptionDefinitionProperty.DESCRIPTION, null, false,
                    'Translatable#Helptext_Admin_SysConfigEdit_Description', null, null, null, null,
                    null, null, null, null, null, null, false, false, true
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID,
                    'object-reference-input', false, 'Translatable#Helptext_Admin_SysConfigEdit_Validity', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                    ]
                ),
                new FormField(
                    'Translatable#Value', SysConfigOptionDefinitionProperty.VALUE, 'text-area-input', false,
                    'Translatable#Helptext_Admin_SysConfigEdit_Value', [
                        new FormFieldOption('isJSON', true)]
                ),
                new FormField(
                    'Translatable#Default Value', SysConfigOptionDefinitionProperty.DEFAULT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_SysConfigEdit_Default_Value', null, null, null, null,
                    null, null, null, null, null, null, false, false, true
                ),

            ]);

            const form = new Form(
                formId, 'Translatable#Edit Key', [group],
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, false, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
