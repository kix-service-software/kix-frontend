/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewWebformDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { WebformProperty } from './model/WebformProperty';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { QueueProperty } from '../ticket/model/QueueProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { TicketStateProperty } from '../ticket/model/TicketStateProperty';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../modules/base-components/webapp/core/InputFieldTypes';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { FormContext } from '../../model/configuration/FormContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewWebformDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'web-form-new-dialog-widget', 'Webform New Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Webform', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'web-form-new-dialog-widget', 'web-form-new-dialog-widget',
                        KIXObjectType.WEBFORM, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {

        const formId = 'webform-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-activate-button',
                'Translatable#Name of activate form button', WebformProperty.BUTTON_LABEL, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_ButtonLabel', null,
                new FormFieldValue('Feedback')
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-title',
                'Translatable#Form title', WebformProperty.TITLE, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-show-title',
                'Translatable#Show title in form', WebformProperty.SHOW_TITLE, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_ShowTitle', null,
                new FormFieldValue(true)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-submit-button',
                'Translatable#Name of form submit button', WebformProperty.SAVE_LABEL, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_SaveButtonLabel', null,
                new FormFieldValue('Submit')
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-hint',
                'Translatable#Information text', WebformProperty.HINT_MESSAGE, 'text-area-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_HintMessage'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-success',
                'Translatable#Message after sending form', WebformProperty.SUCCESS_MESSAGE, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_SuccessMessage', null,
                new FormFieldValue('Thank you for your enquiry! We will contact you as soon as possible.')
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-modal',
                'Translatable#Start modal dialog for form', WebformProperty.MODAL, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_Modal'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-kix-css',
                'Translatable#Use KIX CSS', WebformProperty.USE_KIX_CSS, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_UseKIXCSS', null,
                new FormFieldValue(true)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-allow-attachments',
                'Translatable#Enable attachments', WebformProperty.ALLOW_ATTACHMENTS, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_AllowAttachments'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-domains',
                'Translatable#Accepted domains', WebformProperty.ACCEPTED_DOMAINS, null, true,
                'Translatable#Helptext_Admin_WebformCreateEdit_AcceptedDomains'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-validy',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_WebformCreateEdit_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(2)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'webform-new-form-group-options', 'Translatable#Webform Options',
                [
                    'webform-new-form-field-activate-button',
                    'webform-new-form-field-title',
                    'webform-new-form-field-show-title',
                    'webform-new-form-field-submit-button',
                    'webform-new-form-field-hint',
                    'webform-new-form-field-success',
                    'webform-new-form-field-modal',
                    'webform-new-form-field-kix-css',
                    'webform-new-form-field-allow-attachments',
                    'webform-new-form-field-domains',
                    'webform-new-form-field-validy'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-queue',
                'Translatable#Team', WebformProperty.QUEUE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_QueueID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ], undefined, undefined, [QueueProperty.SUB_QUEUES], [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-priority',
                'Translatable#Priority', WebformProperty.PRIORITY_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_PriorityID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_PRIORITY),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            )
                        ])
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-type',
                'Translatable#Type', WebformProperty.TYPE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_TypeID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_TYPE),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            )
                        ])
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-state',
                'Translatable#State', WebformProperty.STATE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_StateID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            ),
                            new FilterCriteria(
                                TicketStateProperty.TYPE_NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, 'new'
                            )
                        ])
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-agent',
                'Translatable#Assigned agent', WebformProperty.USER_LOGIN, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_AssignedAgent',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ], undefined, undefined, undefined, undefined,
                            [
                                ['requiredPermission', 'TicketCreate']
                            ]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'webform-new-form-field-password',
                'Translatable#Password', WebformProperty.USER_PASSWORD, null, true,
                'Translatable#Helptext_Admin_WebformCreateEdit_AssignedAgentPassword',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'webform-new-form-group-default-values', 'Translatable#Default Values',
                [
                    'webform-new-form-field-queue',
                    'webform-new-form-field-priority',
                    'webform-new-form-field-type',
                    'webform-new-form-field-state',
                    'webform-new-form-field-agent',
                    'webform-new-form-field-password',
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'webform-new-form-page', 'Translatable#New Webform',
                [
                    'webform-new-form-group-options',
                    'webform-new-form-group-default-values'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Webform',
                ['webform-new-form-page'],
                KIXObjectType.WEBFORM
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.WEBFORM, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
