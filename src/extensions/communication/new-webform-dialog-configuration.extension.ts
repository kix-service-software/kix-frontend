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
    FormField, FormFieldValue, Form, KIXObjectType, FormContext, ContextConfiguration, KIXObjectProperty,
    FormFieldOption, ObjectReferenceOptions, KIXObjectLoadingOptions, QueueProperty, FilterCriteria,
    FilterDataType, FilterType, FormFieldOptions, InputFieldTypes, TicketStateProperty
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { WebformProperty } from '../../core/model/webform';
import { SearchOperator } from '../../core/browser';
import { NewWebformDialogContext } from '../../core/browser/webform';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewWebformDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-webform-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const optionsGroup = new FormGroup('Translatable#Webform Options', [
                new FormField(
                    'Translatable#Name of activate form button', WebformProperty.BUTTON_LABEL, null, false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_ButtonLabel', null,
                    new FormFieldValue('Feedback')
                ),
                new FormField(
                    'Translatable#Form title', WebformProperty.TITLE, null, false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_Title'
                ),
                new FormField(
                    'Translatable#Show title in form', WebformProperty.SHOW_TITLE, 'checkbox-input', false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_ShowTitle', null,
                    new FormFieldValue(true)
                ),
                new FormField(
                    'Translatable#Name of form submit button', WebformProperty.SAVE_LABEL, null, false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_SaveButtonLabel', null,
                    new FormFieldValue('Submit')
                ),
                new FormField(
                    'Translatable#Information text', WebformProperty.HINT_MESSAGE, 'text-area-input', false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_HintMessage'
                ),
                new FormField(
                    'Translatable#Message after sending form', WebformProperty.SUCCESS_MESSAGE, null, false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_SuccessMessage', null,
                    new FormFieldValue('Thank you for your enquiry! We will contact you as soon as possible.')
                ),
                new FormField(
                    'Translatable#Start modal dialog for form', WebformProperty.MODAL, 'checkbox-input', false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_Modal'
                ),
                new FormField(
                    'Translatable#Use KIX CSS', WebformProperty.USE_KIX_CSS, 'checkbox-input', false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_UseKIXCSS', null,
                    new FormFieldValue(true)
                ),
                new FormField(
                    'Translatable#Enable attachments', WebformProperty.ALLOW_ATTACHMENTS, 'checkbox-input', false,
                    'Translatable#Helptext_Admin_WebformCreateEdit_AllowAttachments'
                ),
                new FormField(
                    'Translatable#Accepted domains', WebformProperty.ACCEPTED_DOMAINS, null, true,
                    'Translatable#Helptext_Admin_WebformCreateEdit_AcceptedDomains'
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID,
                    'object-reference-input', true, 'Translatable#Helptext_Admin_WebformCreateEdit_Validity', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                    ], new FormFieldValue(2)
                )
            ]);

            const defaultValuesGroup = new FormGroup('Translatable#Default Values', [
                new FormField(
                    'Translatable#Team', WebformProperty.QUEUE_ID, 'object-reference-input', true,
                    'Translatable#Helptext_Admin_WebformCreateEdit_QueueID', [
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
                ),
                new FormField(
                    'Translatable#Priority', WebformProperty.PRIORITY_ID, 'object-reference-input', true,
                    'Translatable#Helptext_Admin_WebformCreateEdit_PriorityID', [
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
                ),
                new FormField(
                    'Translatable#Type', WebformProperty.TYPE_ID, 'object-reference-input', true,
                    'Translatable#Helptext_Admin_WebformCreateEdit_TypeID', [
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
                ),
                new FormField(
                    'Translatable#State', WebformProperty.STATE_ID, 'object-reference-input', true,
                    'Translatable#Helptext_Admin_WebformCreateEdit_StateID', [
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
                ),
                new FormField(
                    'Translatable#Assigned agent', WebformProperty.USER_LOGIN, 'object-reference-input', true,
                    'Translatable#Helptext_Admin_WebformCreateEdit_AssignedAgent', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

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
                ),
                new FormField(
                    'Translatable#Password', WebformProperty.USER_PASSWORD, null, true,
                    'Translatable#Helptext_Admin_WebformCreateEdit_AssignedAgentPassword',
                    [
                        new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                    ]
                )
            ]);

            const form = new Form(
                formId, 'Translatable#New Webform', [optionsGroup, defaultValuesGroup], KIXObjectType.WEBFORM
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.WEBFORM, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
