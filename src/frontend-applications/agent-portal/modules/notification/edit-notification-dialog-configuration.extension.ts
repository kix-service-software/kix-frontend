/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditNotificationDialogContext } from './webapp/core';
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
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditNotificationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const editDialogWidget = new WidgetConfiguration(
            'notification-edit-dialog-widget', 'Edit Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Notification', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(editDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'notification-edit-dialog-widget', 'notification-edit-dialog-widget',
                        KIXObjectType.NOTIFICATION, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'notification-edit-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-name',
                'Translatable#Name', NotificationProperty.NAME, null, true,
                'Translatable#Helptext_Admin_NotificationEdit_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-show-in-preferences',
                'Translatable#Show in agent preferences', NotificationProperty.DATA_VISIBLE_FOR_AGENT,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationEdit_ShowPreferences', undefined,
                new FormFieldValue(true)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-tooltip',
                'Translatable#Agent Preferences Tooltip', NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP, null,
                false, 'Translatable#Helptext_Admin_NotificationEdit_PreferencesTooltip'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_NotificationEdit_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_NotificationEdit_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'notification-edit-form-group-information', 'Translatable#Notification Information',
                [
                    'notification-edit-form-field-name',
                    'notification-edit-form-field-show-in-preferences',
                    'notification-edit-form-field-tooltip',
                    'notification-edit-form-field-comment',
                    'notification-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-events',
                'Translatable#Event', NotificationProperty.DATA_EVENTS, 'notification-input-events', true,
                'Translatable#Helptext_Admin_NotificationEdit_Event'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'notification-edit-form-group-events', 'Translatable#Events',
                [
                    'notification-edit-form-field-events'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-filter',
                '', NotificationProperty.FILTER, 'notification-input-filter', false,
                'Translatable#Helptext_Admin_NotificationEdit_Filter', [], null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, false
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'notification-edit-form-group-filter', 'Translatable#Filter',
                [
                    'notification-edit-form-field-filter'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-send-to',
                'Translatable#Send to', NotificationProperty.DATA_RECIPIENTS, 'default-select-input', false,
                'Translatable#Helptext_Admin_NotificationEdit_SendTo',
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
                            new TreeNode(NotificationRecipientTypes.CUSTOMER, 'Translatable#Contact')
                        ]),
                    new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-send-to-agents',
                'Translatable#Send to these agents', NotificationProperty.DATA_RECIPIENT_AGENTS,
                'object-reference-input', false, 'Translatable#Helptext_Admin_NotificationEdit_SendToAgents',
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
                'notification-edit-form-field-role-members',
                'Translatable#Send to all role members', NotificationProperty.DATA_RECIPIENT_ROLES,
                'object-reference-input', false,
                'Translatable#Helptext_Admin_NotificationEdit_SendToRoleMembers', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-send-despite-out-of-office',
                'Translatable#Send despite out of office', NotificationProperty.DATA_SEND_DESPITE_OOO,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationEdit_SendDespiteOutOfOffice', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-send-once-a-day',
                'Translatable#Once a day', NotificationProperty.DATA_SEND_ONCE_A_DAY,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationEdit_SendOnceADay', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-create-article',
                'Translatable#Create Article', NotificationProperty.DATA_CREATE_ARTICLE,
                'checkbox-input', false,
                'Translatable#Helptext_Admin_NotificationEdit_CreateArticle', undefined,
                new FormFieldValue(false)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'notification-edit-form-group-recipients', 'Translatable#Recipients',
                [
                    'notification-edit-form-field-send-to',
                    'notification-edit-form-field-send-to-agents',
                    'notification-edit-form-field-role-members',
                    'notification-edit-form-field-send-despite-out-of-office',
                    'notification-edit-form-field-send-once-a-day',
                    'notification-edit-form-field-create-article'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'notification-edit-form-field-email',
                'Translatable#Email', null, null, false, null, null, null,
                [],
                [
                    new FormFieldConfiguration(
                        'notification-edit-form-field-additional-recipients',
                        'Translatable#Additional recipients',
                        NotificationProperty.DATA_RECIPIENT_EMAIL,
                        'notification-input-email-recipient', false,
                        'Translatable#Helptext_Admin_NotificationEdit_AdditionalRecipient', null,
                        null, null, null, null, null, null, null, null, null, null, null, null, null,
                        'Translatable#Email Addresses'
                    ),
                    new FormFieldConfiguration(
                        'notification-edit-form-field-with-ticket-number',
                        'Translatable#Subject with Ticketnumber', NotificationProperty.DATA_RECIPIENT_SUBJECT,
                        'checkbox-input', false,
                        'Translatable#Helptext_Admin_NotificationEdit_SubjectWithTicketNumber',
                        undefined, new FormFieldValue(true)
                    )
                ],
                null, null, null, null, null, null, null, true, true
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'notification-edit-form-group-methods', 'Translatable#Notification Methods',
                [
                    'notification-edit-form-field-email',
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'notification-edit-form-page', 'Translatable#Edit Notification',
                [
                    'notification-edit-form-group-information',
                    'notification-edit-form-group-events',
                    'notification-edit-form-group-filter',
                    'notification-edit-form-group-recipients',
                    'notification-edit-form-group-methods'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Notification',
                ['notification-edit-form-page'],
                KIXObjectType.NOTIFICATION, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.NOTIFICATION, formId);

        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
