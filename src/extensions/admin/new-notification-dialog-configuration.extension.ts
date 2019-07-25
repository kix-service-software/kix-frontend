/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewNotificationDialogContext } from '../../core/browser/notification';
import {
    ConfiguredWidget, FormField, FormFieldValue, NotificationProperty, Form,
    KIXObjectType, FormContext, ContextConfiguration, KIXObjectProperty, FormFieldOption, ObjectReferenceOptions,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, DefaultSelectInputFormOption, TreeNode,
    NotificationRecipientTypes, NotificationTicketNumberType, FormFieldOptions
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { SearchOperator, AutocompleteOption } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewNotificationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-notification-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const infoGroup = new FormGroup('Translatable#Notification Information', [
                new FormField(
                    'Translatable#Name', NotificationProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_NotificationCreate_Name'
                ),
                new FormField(
                    'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_NotificationCreate_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_NotificationCreate_Validity',
                    null, new FormFieldValue(1)
                )
            ]);
            const eventGroup = new FormGroup('Translatable#Events', [
                new FormField(
                    'Translatable#Event', NotificationProperty.DATA_EVENTS, 'notification-input-events', true,
                    'Translatable#Helptext_Admin_NotificationCreate_Event'
                )
            ]);

            const filterGroup = new FormGroup('Translatable#Filter', [
                new FormField(
                    '', NotificationProperty.DATA_FILTER, 'notification-input-filter', false,
                    'Translatable#Helptext_Admin_NotificationCreate_Filter', [],
                    null, null, null, null, null, null, null, null, null, null, null, null, null, null, false
                )
            ]);

            const recipientsGroup = new FormGroup('Translatable#Recipients', [
                new FormField(
                    'Translatable#Send to', NotificationProperty.DATA_RECIPIENTS, 'default-select-input', false,
                    'Translatable#Helptext_Admin_NotificationCreate_SendTo', [
                        new FormFieldOption(DefaultSelectInputFormOption.NODES, [
                            new TreeNode(NotificationRecipientTypes.AGENT_OWNER, 'Translatable#TicketOwner'),
                            new TreeNode(
                                NotificationRecipientTypes.AGENT_RESPONSIBLE,
                                'Translatable#TicketResponsible'
                            ),
                            new TreeNode(
                                NotificationRecipientTypes.AGENT_READ_PERMISSIONS,
                                'Translatable#All agents with read permissions for the ticket'
                            ),
                            new TreeNode(
                                NotificationRecipientTypes.AGENT_WRITE_PERMISSIONS,
                                'Translatable#All agents with update permission for the ticket'
                            ),
                            new TreeNode(
                                NotificationRecipientTypes.AGENT_MY_QUEUES,
                                "Translatable#All agents subscribed to the ticket's queue"
                            ),
                            new TreeNode(NotificationRecipientTypes.CUSTOMER, 'Translatable#Contact')
                        ]),
                        new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
                    ]
                ),
                new FormField(
                    'Translatable#Send to these agents', NotificationProperty.DATA_RECIPIENT_AGENTS,
                    'object-reference-input', false, 'Translatable#Helptext_Admin_NotificationCreate_SendToAgents', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                        new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                        new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                            new KIXObjectLoadingOptions([
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ])
                        ),
                        new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
                    ]
                ),
                new FormField(
                    'Translatable#Send to all role members', NotificationProperty.DATA_RECIPIENT_ROLES,
                    'object-reference-input', false,
                    'Translatable#Helptext_Admin_NotificationCreate_SendToRoleMembers', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),
                        new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                        new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                            new KIXObjectLoadingOptions([
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ])
                        ),
                        new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
                    ]
                ),
                new FormField(
                    'Translatable#Send despite out of office', NotificationProperty.DATA_SEND_DESPITE_OOO,
                    'checkbox-input', false,
                    'Translatable#Helptext_Admin_NotificationCreate_SendDespiteOutOfOffice', undefined,
                    new FormFieldValue(false)
                ),
                new FormField(
                    'Translatable#Once a day', NotificationProperty.DATA_SEND_ONCE_A_DAY,
                    'checkbox-input', false,
                    'Translatable#Helptext_Admin_NotificationCreate_SendOnceADay', undefined,
                    new FormFieldValue(false)
                )
            ]);
            const messageGroup = new FormGroup('Translatable#Notification Methods', [
                new FormField(
                    'Translatable#Email', null, null, false, null, null, null, [
                        new FormField(
                            'Translatable#Additional recipients',
                            NotificationProperty.DATA_RECIPIENT_EMAIL,
                            'notification-input-email-recipient', false,
                            'Translatable#Helptext_Admin_NotificationCreate_AdditionalRecipient',
                            null, null, null, null, null, null, null, null, null, null, null, null, null,
                            'Translatable#Email Addresses'
                        ),
                        new FormField(
                            'Translatable#Subject', NotificationProperty.DATA_RECIPIENT_SUBJECT,
                            'default-select-input', false,
                            'Translatable#Helptext_Admin_NotificationCreate_SubjectWithTicketNumber', [
                                new FormFieldOption(DefaultSelectInputFormOption.NODES, [
                                    new TreeNode(NotificationTicketNumberType.WITH, 'Translatable#With Ticketnumber'),
                                    new TreeNode(
                                        NotificationTicketNumberType.WITHOUT,
                                        'Translatable#Without Ticketnumber'
                                    )
                                ])
                            ], new FormFieldValue(NotificationTicketNumberType.WITH)
                        )
                    ], null, null, null, null, null, null, null, true, true
                )
            ]);

            const form = new Form(formId, 'Translatable#New Notification', [
                infoGroup, eventGroup, filterGroup, recipientsGroup, messageGroup
            ], KIXObjectType.NOTIFICATION);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.NOTIFICATION, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
