/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditTicketStateDialogContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, FormFieldValue, TicketStateProperty, FormFieldOption, ObjectReferenceOptions,
    KIXObjectProperty, ConfiguredDialogWidget, ContextMode, WidgetConfiguration
} from '../../core/model';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketStateDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'ticket-state-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-ticket-state-dialog', 'Translatable#Edit State', [], null, null,
            false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            'ticket-state-edit-dialog', 'Ticket State Edit Dialog', ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'ticket-state-edit-dialog-widget', 'ticket-state-edit-dialog-widget',
                    KIXObjectType.TICKET_STATE, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'ticket-state-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-state-edit-form-field-name',
                'Translatable#Name', TicketStateProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-state-edit-form-field-type',
                'Translatable#State Type', TicketStateProperty.TYPE_ID, 'object-reference-input',
                true, 'Translatable#Helptext_Admin_Tickets_StateCreate_Type',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false)
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-state-edit-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Icon'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-state-edit-form-field-comment',
                'Translatable#Comment', TicketStateProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-state-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_StateCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'ticket-state-edit-form-group-data', 'Translatable#State Data',
                [
                    'ticket-state-edit-form-field-name',
                    'ticket-state-edit-form-field-type',
                    'ticket-state-edit-form-field-icon',
                    'ticket-state-edit-form-field-comment',
                    'ticket-state-edit-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'ticket-state-edit-form-page', 'Translatable#Edit State',
                ['ticket-state-edit-form-group-data']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit State',
                ['ticket-state-edit-form-page'],
                KIXObjectType.TICKET_STATE, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TICKET_STATE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
