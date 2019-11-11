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
    KIXObjectType, FormContext, ContextConfiguration,
    KIXObjectProperty, SysConfigOptionDefinitionProperty, FormFieldOption,
    ObjectReferenceOptions, WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { EditSysConfigDialogContext } from '../../core/browser/sysconfig';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditSysConfigDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const widget = new WidgetConfiguration(
            'sysconfig-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-sysconfig-dialog', 'Translatable#Edit Key',
            [], null, null, false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'sysconfig-edit-dialog-widget', 'sysconfig-edit-dialog-widget',
                    KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'sysconfig-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-name',
                'Translatable#Name', SysConfigOptionDefinitionProperty.NAME, null, true,
                'Translatable#Helptext_Admin_SysConfigEdit_Name', null, null, null, null, null,
                null, null, null, null, null, null, false, false, true
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-description',
                'Translatable#Description', SysConfigOptionDefinitionProperty.DESCRIPTION, null, false,
                'Translatable#Helptext_Admin_SysConfigEdit_Description', null, null, null, null, null,
                null, null, null, null, null, null, false, false, true
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', false, 'Translatable#Helptext_Admin_SysConfigEdit_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-value',
                'Translatable#Value', SysConfigOptionDefinitionProperty.VALUE, 'text-area-input', false,
                'Translatable#Helptext_Admin_SysConfigEdit_Value', [
                new FormFieldOption('isJSON', true)]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-default-value',
                'Translatable#Default Value', SysConfigOptionDefinitionProperty.DEFAULT, 'text-area-input', false,
                'Translatable#Helptext_Admin_SysConfigEdit_Default_Value', null, null, null, null, null,
                null, null, null, null, null, null, false, false, true
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'sysconfig-edit-form-group-information', 'Translatable#SysConfig',
                [
                    'sysconfig-edit-form-field-name',
                    'sysconfig-edit-form-field-description',
                    'sysconfig-edit-form-field-valid',
                    'sysconfig-edit-form-field-value',
                    'sysconfig-edit-form-field-default-value'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'sysconfig-edit-form-page', 'Translatable#SysConfig',
                ['sysconfig-edit-form-group-information']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Key',
                [
                    'sysconfig-edit-form-page'
                ],
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, false, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm(
            [FormContext.EDIT], KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, formId
        );
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
