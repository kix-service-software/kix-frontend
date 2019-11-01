/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditTicketPriorityDialogContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, FormFieldValue, TicketPriorityProperty, KIXObjectProperty, ObjectReferenceOptions,
    FormFieldOption, ContextMode, WidgetConfiguration, ConfiguredDialogWidget
} from '../../core/model';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketPriorityDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'ticket-priority-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-ticket-priority-dialog', 'Translatable#Edit Priority', [], null, null,
            false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            'ticket-priority-edit-dialog', 'Ticket Priority Edit Dialog', ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'ticket-priority-edit-dialog-widget', 'ticket-priority-edit-dialog-widget',
                    KIXObjectType.TICKET_PRIORITY, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'ticket-priority-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-name',
                'Translatable#Name', TicketPriorityProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Name'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Icon'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-comment',
                'Translatable#Comment', TicketPriorityProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Comment',
                null, null, null, null, null, null, null, 250
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_PriorityCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'ticket-priority-edit-form-group-data', 'Translatable#Priority Data',
                [
                    'ticket-priority-edit-form-field-name',
                    'ticket-priority-edit-form-field-icon',
                    'ticket-priority-edit-form-field-comment',
                    'ticket-priority-edit-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Create Priority', ['ticket-priority-edit-form-group-data'],
                KIXObjectType.TICKET_PRIORITY, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TICKET_PRIORITY, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
