/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewNotificationDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { NotificationProperty } from './model/NotificationProperty';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { DefaultSelectInputFormOption } from '../../model/configuration/DefaultSelectInputFormOption';
import { TreeNode } from '../base-components/webapp/core/tree';
import { NotificationRecipientTypes } from './model/NotificationRecipientTypes';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { FormContext } from '../../model/configuration/FormContext';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewNotificationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDIalogWidget = new WidgetConfiguration(
            'notification-new-dialog-widget', 'New Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Notification', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(newDIalogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'notification-new-dialog-widget', 'notification-new-dialog-widget',
                        KIXObjectType.NOTIFICATION, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'notification-new-form';

        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-name',
                'Translatable#Name', NotificationProperty.NAME, null, true,
                'Translatable#Helptext_Admin_NotificationCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-show-in-preferences',
                'Translatable#Show in agent preferences', NotificationProperty.DATA_VISIBLE_FOR_AGENT,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_ShowPreferences', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-tooltip',
                'Translatable#Agent Preferences Tooltip', NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP, null,
                false, 'Translatable#Helptext_Admin_NotificationCreate_PreferencesTooltip'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_NotificationCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
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

        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-events',
                'Translatable#Event', NotificationProperty.DATA_EVENTS, 'notification-input-events', true,
                'Translatable#Helptext_Admin_NotificationCreate_Event'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'notification-new-form-group-events', 'Translatable#Events',
                [
                    'notification-new-form-field-events'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-filter',
                '', NotificationProperty.FILTER, 'notification-input-filter', false,
                'Translatable#Helptext_Admin_NotificationCreate_Filter', [], null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, false
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'notification-new-form-group-filter', 'Translatable#Filter',
                [
                    'notification-new-form-field-filter'
                ]
            )
        );

        configurations.push(
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
                                'Translatable#All agents subscribed to the tickets queue'
                            ),
                            new TreeNode(NotificationRecipientTypes.CUSTOMER, 'Translatable#Contact'),
                            new TreeNode(NotificationRecipientTypes.AGENT_WATCHER, 'Translatable#All agents watching this ticket')
                        ]),
                    new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-send-to-agents',
                'Translatable#Send to these agents', NotificationProperty.DATA_RECIPIENT_AGENTS,
                'object-reference-input', false, 'Translatable#Helptext_Admin_NotificationCreate_SendToAgents',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                    new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE_PRELOAD_PATTERN, '*')
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-role-members',
                'Translatable#Send to all role members', NotificationProperty.DATA_RECIPIENT_ROLES,
                'object-reference-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_SendToRoleMembers', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-send-despite-out-of-office',
                'Translatable#Send despite out of office', NotificationProperty.DATA_SEND_DESPITE_OOO,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_SendDespiteOutOfOffice', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-send-once-a-day',
                'Translatable#Once a day', NotificationProperty.DATA_SEND_ONCE_A_DAY,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_SendOnceADay', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-new-form-field-create-article',
                'Translatable#Create Article', NotificationProperty.DATA_CREATE_ARTICLE,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationCreate_CreateArticle', undefined,
                new FormFieldValue(false)
            )
        );

        configurations.push(
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

        configurations.push(
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

        configurations.push(
            new FormGroupConfiguration(
                'notification-new-form-group-methods', 'Translatable#Notification Methods',
                [
                    'notification-new-form-field-email',
                ]
            )
        );

        configurations.push(
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

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Notification',
                ['notification-new-form-page'],
                KIXObjectType.NOTIFICATION
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.NOTIFICATION, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
