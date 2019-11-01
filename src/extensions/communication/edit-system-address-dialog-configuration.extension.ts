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
    FormFieldValue, SystemAddressProperty,
    KIXObjectType, FormContext, ContextConfiguration, KIXObjectProperty, FormFieldOption,
    ObjectReferenceOptions, WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { FormValidationService } from '../../core/browser/form/validation';
import { EditSystemAddressDialogContext } from '../../core/browser/system-address';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditSystemAddressDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const widget = new WidgetConfiguration(
            'system-address-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-system-address-dialog', 'Translatable#Edit Address',
            [], null, null, false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'system-address-edit-dialog-widget', 'system-address-edit-dialog-widget',
                    KIXObjectType.SYSTEM_ADDRESS, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'system-address-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'system-address-new-form-field-email',
                'Translatable#Email Address', SystemAddressProperty.NAME, null, true,
                'Translatable#Helptext_Admin_SystemAddressCreate_Name', null, null, null, null, null, null,
                null, null, null, FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'system-address-new-form-field-name',
                'Translatable#Display Name', SystemAddressProperty.REALNAME, null, true,
                'Translatable#Helptext_Admin_SystemAddressCreate_DisplayName'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'system-address-new-form-field-comment',
                'Translatable#Comment', SystemAddressProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_SystemAddressCreate_Comment', null, null, null,
                null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'system-address-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_SystemAddressCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'system-address-new-form-group-information', 'Translatable#System Addresses',
                [
                    'system-address-new-form-field-email',
                    'system-address-new-form-field-name',
                    'system-address-new-form-field-comment',
                    'system-address-new-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Address',
                [
                    'system-address-new-form-group-information'
                ],
                KIXObjectType.SYSTEM_ADDRESS, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.SYSTEM_ADDRESS, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
