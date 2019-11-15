/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewQueueDialogContext } from '../../core/browser/ticket';
import {
    KIXObjectType,
    FormContext, FormFieldValue, ContextConfiguration, QueueProperty, FormFieldOption, ObjectReferenceOptions,
    KIXObjectLoadingOptions, FilterCriteria, SystemAddressProperty, FilterDataType, FilterType,
    NumberInputOptions, KIXObjectProperty, ConfiguredDialogWidget, ContextMode, WidgetConfiguration
} from '../../core/model';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewQueueDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'queue-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-ticket-queue-dialog', 'Translatable#New Queue', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Queue New Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'queue-new-dialog-widget', 'queue-new-dialog-widget',
                        KIXObjectType.QUEUE, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'queue-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-name',
                'Translatable#Name', QueueProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_Icon.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-parent',
                'Translatable#Parent Queue', QueueProperty.PARENT_ID, 'object-reference-input', false,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_ParentQueue', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, null
                            )
                        ],
                        null, null,
                        [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
                        [QueueProperty.SUB_QUEUES]
                    )
                )
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-followup',
                'Translatable#Follow Up on Tickets', QueueProperty.FOLLOW_UP_ID, 'queue-input-follow-up',
                true, 'Translatable#Helptext_Admin_Tickets_QueueCreate_FollowUp', null, new FormFieldValue(3)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-unlock-timeout',
                'Translatable#Unlock Timeout', QueueProperty.UNLOCK_TIMEOUT, 'number-input',
                false, 'Translatable#Helptext_Admin_Tickets_QueueCreate_UnlockTimeout', [
                new FormFieldOption(NumberInputOptions.MIN, 0),
                new FormFieldOption(NumberInputOptions.UNIT_STRING, 'Translatable#Minutes')
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-sender-address',
                'Translatable#Sender Address (Email)', QueueProperty.SYSTEM_ADDRESS_ID, 'object-reference-input',
                true, 'Translatable#Helptext_Admin_Tickets_QueueCreate_SenderAddress.', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.SYSTEM_ADDRESS),

                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                SystemAddressProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            )
                        ]
                    )
                )
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-comment',
                'Translatable#Comment', QueueProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_QueueCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'queue-new-form-group-informations', 'Translatable#Queue Information',
                [
                    'queue-new-form-field-name',
                    'queue-new-form-field-icon',
                    'queue-new-form-field-parent',
                    'queue-new-form-field-followup',
                    'queue-new-form-field-unlock-timeout',
                    'queue-new-form-field-sender-address',
                    'queue-new-form-field-comment',
                    'queue-new-form-field-valid'
                ]
            )
        );


        configurations.push(
            new FormFieldConfiguration(
                'queue-new-form-field-signature',
                'Translatable#Signature', QueueProperty.SIGNATURE, 'rich-text-input', false,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_Signature', undefined,
                new FormFieldValue(
                    '--<br/>'
                    + '&lt;KIX_CONFIG_OrganizationLong&gt;<br/>'
                    + '&lt;KIX_CONFIG_OrganizationAddress&gt;<br/>'
                    + '&lt;KIX_CONFIG_OrganizationRegistrationLocation&gt; '
                    + '&lt;KIX_CONFIG_OrganizationRegistrationNumber&gt;<br/>'
                    + '&lt;KIX_CONFIG_OrganizationDirectors&gt;'
                )
            )
        );
        configurations.push(
            new FormGroupConfiguration(
                'queue-new-form-group-signatrue', 'Translatable#Signature',
                [
                    'queue-new-form-field-signature'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'queue-new-form-page', 'Translatable#New Queue',
                [
                    'queue-new-form-group-informations',
                    'queue-new-form-group-signatrue'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Queue',
                ['queue-new-form-page'],
                KIXObjectType.QUEUE
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.QUEUE, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
