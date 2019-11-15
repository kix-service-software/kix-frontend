/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewTicketTypeDialogContext } from '../../core/browser/ticket';
import {
    KIXObjectType, FormContext, FormFieldValue,
    TicketTypeProperty, ContextConfiguration,
    KIXObjectProperty, ObjectReferenceOptions, FormFieldOption, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../core/model';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketTypeDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'ticket-type-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-ticket-type-dialog', 'Translatable#New Type', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Type New Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-type-new-dialog-widget', 'ticket-type-new-dialog-widget',
                        KIXObjectType.TICKET_TYPE, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );
        return configurations;
    }

    // tslint:disable:max-line-length
    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'ticket-type-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'ticket-type-new-form-field-name',
                'Translatable#Name', TicketTypeProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_TypeCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-type-new-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_TypeCreate_Icon'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-type-new-form-field-comment',
                'Translatable#Comment', TicketTypeProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_TypeCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-type-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_TypeCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-type-new-form-group-data',
                'Translatable#Type Data',
                [
                    'ticket-type-new-form-field-name',
                    'ticket-type-new-form-field-icon',
                    'ticket-type-new-form-field-comment',
                    'ticket-type-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-type-new-form-page', 'Translatable#Create Type',
                ['ticket-type-new-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(formId, 'Translatable#Create Type', ['ticket-type-new-form-page'], KIXObjectType.TICKET_TYPE)
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET_TYPE, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
