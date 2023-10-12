/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditSystemAddressDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { SystemAddressProperty } from './model/SystemAddressProperty';
import { FormValidationService } from '../../modules/base-components/webapp/core/FormValidationService';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';

import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../base-components/webapp/core/InputFieldTypes';
import { SearchOperator } from '../search/model/SearchOperator';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditSystemAddressDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'system-address-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Address',
            [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'system-address-edit-dialog-widget', 'system-address-edit-dialog-widget',
                        KIXObjectType.SYSTEM_ADDRESS, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'system-address-edit-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'system-address-edit-form-field-email',
                'Translatable#Email Address', SystemAddressProperty.NAME, null, true,
                'Translatable#Helptext_Admin_SystemAddressCreate_Name', null, null, null, null, null, null,
                null, null, null, FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'system-address-edit-form-field-name',
                'Translatable#Display Name', SystemAddressProperty.REALNAME, null, true,
                'Translatable#Helptext_Admin_SystemAddressCreate_DisplayName'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'system-address-edit-form-field-queue',
                'Translatable#Queue', SystemAddressProperty.QUEUE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Admin_SystemAddressCreate_Queue',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            )
                        ])
                    ),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE)
                ], null
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'system-address-edit-form-field-comment',
                'Translatable#Comment', SystemAddressProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_SystemAddressCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'system-address-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_SystemAddressCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'system-address-edit-form-group-information', 'Translatable#System Addresses',
                [
                    'system-address-edit-form-field-email',
                    'system-address-edit-form-field-name',
                    'system-address-edit-form-field-queue',
                    'system-address-edit-form-field-comment',
                    'system-address-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'system-address-edit-form-page', 'Translatable#Edit Address',
                ['system-address-edit-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Address',
                ['system-address-edit-form-page'],
                KIXObjectType.SYSTEM_ADDRESS, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.SYSTEM_ADDRESS, formId);
        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
