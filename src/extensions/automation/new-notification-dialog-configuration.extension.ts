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
    FormFieldValue, NotificationProperty,
    KIXObjectType, FormContext, ContextConfiguration, KIXObjectProperty, FormFieldOption, ObjectReferenceOptions,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, DefaultSelectInputFormOption, TreeNode,
    NotificationRecipientTypes,
    WidgetConfiguration,
    ConfiguredDialogWidget,
    ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewNotificationDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const newDIalogWidget = new WidgetConfiguration(
            'notification-new-dialog-widget', 'New DIalog Widget', ConfigurationType.Widget,
            'new-notification-dialog', 'Translatable#New Notification', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(newDIalogWidget);


        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'notification-new-dialog-widget', 'notification-new-dialog-widget',
                    KIXObjectType.NOTIFICATION, ContextMode.CREATE_ADMIN
                )
            ]

        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {

        const formId = 'notification-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-name',
                'Translatable#Name', NotificationProperty.NAME, null, true,
                'Translatable#Helptext_Admin_NotificationCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-show-in-preferences',
                'Translatable#Show in agent preferences', NotificationProperty.DATA_VISIBLE_FOR_AGENT,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_ShowPreferences', undefined,
                new FormFieldValue(true)
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-tooltip',
                'Translatable#Agent Preferences Tooltip', NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP, null,
                false, 'Translatable#Helptext_Admin_NotificationCreate_PreferencesTooltip'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_NotificationCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'notification-new-form-group-information', 'Translatable#Notification Information',
                [
                    'notification-new-form-field-name',
                    'notification-new-form-field-show-in-preferences',
                    'notification-new-form-field-tooltip',
                    'notification-new-form-field-comment',
                    'notification-new-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-events',
                'Translatable#Event', NotificationProperty.DATA_EVENTS, 'notification-input-events', true,
                'Translatable#Helptext_Admin_NotificationCreate_Event'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'notification-new-form-group-events', 'Translatable#Events',
                [
                    'notification-new-form-field-events'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-filter',
                '', NotificationProperty.DATA_FILTER, 'notification-input-filter', false,
                'Translatable#Helptext_Admin_NotificationCreate_Filter', [], null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, false
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'notification-new-form-group-filter', 'Translatable#Filter',
                [
                    'notification-new-form-field-filter'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-send-to',
                'Translatable#Send to', NotificationProperty.DATA_RECIPIENTS, 'default-select-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_SendTo',
                [
                    new FormFieldOption(DefaultSelectInputFormOption.NODES,
                        [
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
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-send-to-agents',
                'Translatable#Send to these agents', NotificationProperty.DATA_RECIPIENT_AGENTS,
                'object-reference-input', false, 'Translatable#Helptext_Admin_NotificationCreate_SendToAgents',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

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
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-role-members',
                'Translatable#Send to all role members', NotificationProperty.DATA_RECIPIENT_ROLES,
                'object-reference-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_SendToRoleMembers', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),

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
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-send-despite-out-of-office',
                'Translatable#Send despite out of office', NotificationProperty.DATA_SEND_DESPITE_OOO,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_SendDespiteOutOfOffice', undefined,
                new FormFieldValue(false)
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-send-once-a-day',
                'Translatable#Once a day', NotificationProperty.DATA_SEND_ONCE_A_DAY,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_SendOnceADay', undefined,
                new FormFieldValue(false)
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-create-article',
                'Translatable#Create Article', NotificationProperty.DATA_CREATE_ARTICLE,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_CreateArticle', undefined,
                new FormFieldValue(false)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'notification-new-form-group-recipients', 'Translatable#Recipients',
                [
                    'notification-new-form-field-send-to',
                    'notification-new-form-field-send-to-agents',
                    'notification-new-form-field-role-members',
                    'notification-new-form-field-send-despite-out-of-office',
                    'notification-new-form-field-send-once-a-day',
                    'notification-new-form-field-create-article'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'notification-new-form-field-email',
                'Translatable#Email', null, null, false, null, null, null,
                [],
                [
                    new FormFieldConfiguration(
                        'notification-new-form-field-additional-recipients',
                        'Translatable#Additional recipients',
                        NotificationProperty.DATA_RECIPIENT_EMAIL,
                        'notification-input-email-recipient', false,
                        'Translatable#Helptext_Admin_NotificationCreate_AdditionalRecipient',
                        null, null, null, null, null, null, null, null, null, null, null, null, null, null,
                        'Translatable#Email Addresses'
                    ),
                    new FormFieldConfiguration(
                        'notification-new-form-field-with-ticket-number',
                        'Translatable#Subject with Ticketnumber', NotificationProperty.DATA_RECIPIENT_SUBJECT,
                        'checkbox-input', false,
                        'Translatable#Helptext_Admin_NotificationCreate_SubjectWithTicketNumber',
                        undefined, new FormFieldValue(true)
                    )
                ],
                null, null, null, null, null, null, null, true, true
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'notification-new-form-group-methods', 'Translatable#Notification Methods',
                [
                    'notification-new-form-field-email',
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'notification-new-form-page', 'Translatable#New Notification',
                [
                    'notification-new-form-group-information',
                    'notification-new-form-group-events',
                    'notification-new-form-group-filter',
                    'notification-new-form-group-recipients',
                    'notification-new-form-group-methods'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Notification',
                ['notification-new-form-page'],
                KIXObjectType.NOTIFICATION
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.NOTIFICATION, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
