/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditSysConfigDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { SysConfigOptionDefinitionProperty } from './model/SysConfigOptionDefinitionProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditSysConfigDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        configurations.push(
            new WidgetConfiguration(
                'sysconfig-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
                'object-dialog-form-widget', 'Translatable#Edit Key',
                [], null, null, false, false, 'kix-icon-edit'
            )
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'sysconfig-edit-dialog-widget', 'sysconfig-edit-dialog-widget',
                        KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];

        const formId = 'sysconfig-edit-form';

        configurations.push(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-name',
                'Translatable#Name', SysConfigOptionDefinitionProperty.NAME, null, true,
                'Translatable#Helptext_Admin_SysConfigEdit_Name', null, null, null, null, null,
                null, null, null, null, null, null, false, false, true
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-description',
                'Translatable#Description', SysConfigOptionDefinitionProperty.DESCRIPTION, 'text-area-input', false,
                'Translatable#Helptext_Admin_SysConfigEdit_Description', null, null, null, null, null,
                null, null, null, null, null, null, false, false, true
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_SysConfigEdit_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-value',
                'Translatable#Value', SysConfigOptionDefinitionProperty.VALUE, 'text-area-input', false,
                'Translatable#Helptext_Admin_SysConfigEdit_Value', [
                new FormFieldOption(FormFieldOptions.IS_JSON, true)]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'sysconfig-edit-form-field-default-value',
                'Translatable#Default Value', SysConfigOptionDefinitionProperty.DEFAULT, 'text-area-input', false,
                'Translatable#Helptext_Admin_SysConfigEdit_Default_Value', null, null, null, null, null,
                null, null, null, null, null, null, false, false, true
            )
        );

        configurations.push(
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

        configurations.push(
            new FormPageConfiguration(
                'sysconfig-edit-form-page', 'Translatable#SysConfig',
                ['sysconfig-edit-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Key',
                [
                    'sysconfig-edit-form-page'
                ],
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, true, FormContext.EDIT
            )
        );

        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.EDIT], KIXObjectType.SYS_CONFIG_OPTION, formId
        );

        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
