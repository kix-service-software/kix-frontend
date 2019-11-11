/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditTicketTypeDialogContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, KIXObjectType, FormContext, FormFieldValue, TicketTypeProperty,
    KIXObjectProperty, FormFieldOption, ObjectReferenceOptions, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../core/model';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketTypeDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'ticket-type-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-ticket-type-dialog', 'Translatable#Edit Type', [], null, null,
            false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            'ticket-type-edit-dialog', 'Ticket Type Edit Dialog', ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'ticket-type-edit-dialog-widget', 'ticket-type-edit-dialog-widget',
                    KIXObjectType.TICKET_TYPE, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'ticket-type-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-type-edit-form-field-name',
                'Translatable#Name', TicketTypeProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_TypeCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-type-edit-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_TypeCreate_Icon'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-type-edit-form-field-comment',
                'Translatable#Comment', TicketTypeProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_TypeCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-type-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_TypeCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'ticket-type-edit-form-group-data',
                'Translatable#Type Data',
                [
                    'ticket-type-edit-form-field-name',
                    'ticket-type-edit-form-field-icon',
                    'ticket-type-edit-form-field-comment',
                    'ticket-type-edit-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'ticket-type-edit-form-page', 'Translatable#Edit Type',
                ['ticket-type-edit-form-group-data']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Type',
                ['ticket-type-edit-form-page'],
                KIXObjectType.TICKET_TYPE, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TICKET_TYPE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
