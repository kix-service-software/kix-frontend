/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditQueueDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { QueueProperty } from './model/QueueProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { NumberInputOptions } from '../../modules/base-components/webapp/core/NumberInputOptions';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditQueueDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'queue-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Queue', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Queue Edit Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'queue-edit-dialog-widget', 'queue-edit-dialog-widget',
                        KIXObjectType.QUEUE, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'queue-edit-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-name',
                'Translatable#Name', QueueProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_Icon.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-parent',
                'Translatable#Parent Queue', QueueProperty.PARENT_ID, 'object-reference-input', false,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_ParentQueue', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, null
                            )
                        ],
                        null, null,
                        [QueueProperty.SUB_QUEUES],
                        [QueueProperty.SUB_QUEUES]
                    )
                ),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-followup',
                'Translatable#Follow Up on Tickets', QueueProperty.FOLLOW_UP_ID, 'queue-input-follow-up',
                true, 'Translatable#Helptext_Admin_Tickets_QueueCreate_FollowUp', null, new FormFieldValue(3)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-unlock-timeout',
                'Translatable#Unlock Timeout', QueueProperty.UNLOCK_TIMEOUT, 'number-input',
                false, 'Translatable#Helptext_Admin_Tickets_QueueCreate_UnlockTimeout', [
                new FormFieldOption(NumberInputOptions.MIN, 0),
                new FormFieldOption(NumberInputOptions.UNIT_STRING, 'Translatable#Minutes')
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-sender-address',
                'Translatable#Sender Address (Email)', QueueProperty.SYSTEM_ADDRESS_ID, 'object-reference-input',
                true, 'Translatable#Helptext_Admin_Tickets_QueueCreate_SenderAddress.', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.SYSTEM_ADDRESS),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-comment',
                'Translatable#Comment', QueueProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_QueueCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_QueueCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'queue-edit-form-group-informations', 'Translatable#Queue Information',
                [
                    'queue-edit-form-field-name',
                    'queue-edit-form-field-icon',
                    'queue-edit-form-field-parent',
                    'queue-edit-form-field-followup',
                    'queue-edit-form-field-unlock-timeout',
                    'queue-edit-form-field-sender-address',
                    'queue-edit-form-field-comment',
                    'queue-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'queue-edit-form-field-signature',
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
                'queue-edit-form-group-signatrue', 'Translatable#Signature',
                [
                    'queue-edit-form-field-signature'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'queue-edit-form-page', 'Translatable#Edit Queue',
                [
                    'queue-edit-form-group-informations',
                    'queue-edit-form-group-signatrue'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Queue',
                ['queue-edit-form-page'],
                KIXObjectType.QUEUE, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.QUEUE, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
