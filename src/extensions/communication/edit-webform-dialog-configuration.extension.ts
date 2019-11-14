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
    FormFieldValue, KIXObjectType,
    FormContext, ContextConfiguration, KIXObjectProperty,
    FormFieldOption, ObjectReferenceOptions, KIXObjectLoadingOptions, QueueProperty, FilterCriteria,
    FilterDataType, FilterType, FormFieldOptions, InputFieldTypes, TicketStateProperty, ConfiguredDialogWidget,
    WidgetConfiguration, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { WebformProperty } from '../../core/model/webform';
import { SearchOperator } from '../../core/browser';
import { EditWebformDialogContext } from '../../core/browser/webform';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditWebformDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const editDialogWidget = new WidgetConfiguration(
            'webform-edit-dialog-widget', 'Webform Edit Dialog Widget', ConfigurationType.Widget,
            'edit-webform-dialog', 'Translatable#Edit Webform', [], null, null,
            false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(editDialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'webform-edit-dialog-widget', 'webform-edit-dialog-widget',
                    KIXObjectType.WEBFORM, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'webform-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-activate-button',
                'Translatable#Name of activate form button', WebformProperty.BUTTON_LABEL, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_ButtonLabel', null,
                new FormFieldValue('Feedback')
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-title',
                'Translatable#Form title', WebformProperty.TITLE, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_Title'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-show-title',
                'Translatable#Show title in form', WebformProperty.SHOW_TITLE, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_ShowTitle', null,
                new FormFieldValue(true)
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-submit-button',
                'Translatable#Name of form submit button', WebformProperty.SAVE_LABEL, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_SaveButtonLabel', null,
                new FormFieldValue('Submit')
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-hint',
                'Translatable#Information text', WebformProperty.HINT_MESSAGE, 'text-area-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_HintMessage'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-success',
                'Translatable#Message after sending form', WebformProperty.SUCCESS_MESSAGE, null, false,
                'Translatable#Helptext_Admin_WebformCreateEdit_SuccessMessage', null,
                new FormFieldValue('Thank you for your enquiry! We will contact you as soon as possible.')
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-modal',
                'Translatable#Start modal dialog for form', WebformProperty.MODAL, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_Modal'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-kix-css',
                'Translatable#Use KIX CSS', WebformProperty.USE_KIX_CSS, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_UseKIXCSS', null,
                new FormFieldValue(true)
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-allow-attachments',
                'Translatable#Enable attachments', WebformProperty.ALLOW_ATTACHMENTS, 'checkbox-input', false,
                'Translatable#Helptext_Admin_WebformCreateEdit_AllowAttachments'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-domains',
                'Translatable#Accepted domains', WebformProperty.ACCEPTED_DOMAINS, null, true,
                'Translatable#Helptext_Admin_WebformCreateEdit_AcceptedDomains'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-validy',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_WebformCreateEdit_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(2)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'webform-edit-form-group-options', 'Translatable#Webform Options',
                [
                    'webform-edit-form-field-activate-button',
                    'webform-edit-form-field-title',
                    'webform-edit-form-field-show-title',
                    'webform-edit-form-field-submit-button',
                    'webform-edit-form-field-hint',
                    'webform-edit-form-field-success',
                    'webform-edit-form-field-modal',
                    'webform-edit-form-field-kix-css',
                    'webform-edit-form-field-allow-attachments',
                    'webform-edit-form-field-domains',
                    'webform-edit-form-field-validy'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-queue',
                'Translatable#Team', WebformProperty.QUEUE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_QueueID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-priority',
                'Translatable#Priority', WebformProperty.PRIORITY_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_PriorityID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_PRIORITY),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, false),
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-type',
                'Translatable#Type', WebformProperty.TYPE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_TypeID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_TYPE),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, false),
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-state',
                'Translatable#State', WebformProperty.STATE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_StateID',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, false),
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-agent',
                'Translatable#Assigned agent', WebformProperty.USER_LOGIN, 'object-reference-input', true,
                'Translatable#Helptext_Admin_WebformCreateEdit_AssignedAgent',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ], undefined, undefined, undefined, undefined,
                            [
                                ['requiredPermission', 'TicketRead,TicketUpdate']
                            ]
                        )
                    )
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'webform-edit-form-field-password',
                'Translatable#Password', WebformProperty.USER_PASSWORD, null, true,
                'Translatable#Helptext_Admin_WebformCreateEdit_AssignedAgentPassword',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'webform-edit-form-group-default-values', 'Translatable#Default Values',
                [
                    'webform-edit-form-field-queue',
                    'webform-edit-form-field-priority',
                    'webform-edit-form-field-type',
                    'webform-edit-form-field-state',
                    'webform-edit-form-field-agent',
                    'webform-edit-form-field-password',
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'webform-edit-form-page', 'Translatable#Edit Webform',
                [
                    'webform-edit-form-group-options',
                    'webform-edit-form-group-default-values'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Webform',
                ['webform-edit-form-page'],
                KIXObjectType.WEBFORM, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.WEBFORM, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
