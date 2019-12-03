/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewSystemAddressDialogContext } from '../../core/browser/system-address/context';
import {
    FormFieldValue, SystemAddressProperty,
    KIXObjectType, FormContext, ContextConfiguration, FormFieldOption, ObjectReferenceOptions,
    KIXObjectProperty, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { FormValidationService } from '../../core/browser/form/validation';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewSystemAddressDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'system-address-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-system-address-dialog', 'Translatable#New Address',
            [], null, null, false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'system-address-new-dialog-widget', 'system-address-new-dialog-widget',
                        KIXObjectType.SYSTEM_ADDRESS, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'system-address-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'system-address-new-form-field-email',
                'Translatable#Email Address', SystemAddressProperty.NAME, null, true,
                'Translatable#Helptext_Admin_SystemAddressCreate_Name', null, null, null, null, null, null,
                null, null, null, FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'system-address-new-form-field-name',
                'Translatable#Display Name', SystemAddressProperty.REALNAME, null, true,
                'Translatable#Helptext_Admin_SystemAddressCreate_DisplayName'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'system-address-new-form-field-comment',
                'Translatable#Comment', SystemAddressProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_SystemAddressCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'system-address-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_SystemAddressCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
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

        configurations.push(
            new FormPageConfiguration(
                'system-address-new-form-page', 'Translatable#New Address',
                ['system-address-new-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Address',
                ['system-address-new-form-page'],
                KIXObjectType.SYSTEM_ADDRESS
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.SYSTEM_ADDRESS, formId);

        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
