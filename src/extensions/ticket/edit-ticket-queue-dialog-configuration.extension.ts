/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditQueueDialogContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, QueueProperty, FormFieldOption, NumberInputOptions, ObjectReferenceOptions,
    KIXObjectLoadingOptions, FilterCriteria, SystemAddressProperty, FilterDataType, FilterType, FormFieldOptions,
    KIXObjectProperty
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditQueueDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-ticket-queue-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const infoGroup = new FormGroup('Translatable#Queue Information', [
                new FormField(
                    'Translatable#Name', QueueProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_Tickets_Tickets_QueueEdit_Name'
                ),
                new FormField(
                    'Translatable#Icon', 'ICON', 'icon-input', false,
                    'Translatable#Helptext_Admin_Tickets_QueueEdit_Icon.'
                ),
                new FormField(
                    'Translatable#Parent Queue', QueueProperty.PARENT_ID, 'ticket-input-queue', false,
                    'Translatable#Helptext_Admin_Tickets_QueueEdit_ParentQueue', [
                        new FormFieldOption(FormFieldOptions.SHOW_INVALID, true)
                    ]
                ),
                new FormField(
                    'Translatable#Follow Up on Tickets', QueueProperty.FOLLOW_UP_ID, 'queue-input-follow-up',
                    true, 'Translatable#Helptext_Admin_Tickets_QueueEdit_FollowUp'
                ),
                new FormField(
                    'Translatable#Unlock Timeout', QueueProperty.UNLOCK_TIMEOUT, 'number-input',
                    false, 'Translatable#Helptext_Admin_Tickets_QueueEdit_UnlockTimeout', [
                        new FormFieldOption(NumberInputOptions.MIN, 0),
                        new FormFieldOption(NumberInputOptions.UNIT_STRING, 'Translatable#Minutes')
                    ]
                ),
                new FormField(
                    'Translatable#Sender Address (Email)', QueueProperty.SYSTEM_ADDRESS_ID, 'object-reference-input',
                    true, 'Translatable#Helptext_Admin_Tickets_QueueEdit_SenderAddress.', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.SYSTEM_ADDRESS),
                        new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
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
                ),
                new FormField(
                    'Translatable#Comment', QueueProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_Tickets_QueueEdit_Comment',
                    null, null, null, null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_Tickets_QueueEdit_Validity',
                    null, new FormFieldValue(1)
                )
            ]);
            const signatureGroup = new FormGroup('Translatable#Signature', [
                new FormField(
                    'Translatable#Signature', QueueProperty.SIGNATURE, 'rich-text-input', false,
                    'Translatable#Helptext_Admin_Tickets_QueueEdit_Signature'
                )
            ]);

            const form = new Form(
                formId, 'Translatable#Edit Queue', [infoGroup, signatureGroup], KIXObjectType.QUEUE,
                true, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.QUEUE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
