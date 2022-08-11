/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewTicketPriorityDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { TicketPriorityProperty } from './model/TicketPriorityProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketPriorityDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'ticket-priority-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Priority', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Priority New Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-priority-new-dialog-widget', 'ticket-priority-new-dialog-widget',
                        KIXObjectType.TICKET_PRIORITY, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'ticket-priority-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-new-form-field-name',
                'Translatable#Name', TicketPriorityProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Name'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-new-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Icon'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-new-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_PriorityCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-priority-new-form-group-data', 'Translatable#Priority Data',
                [
                    'ticket-priority-new-form-field-name',
                    'ticket-priority-new-form-field-icon',
                    'ticket-priority-new-form-field-comment',
                    'ticket-priority-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-priority-new-form-page', 'Translatable#Create Priority',
                ['ticket-priority-new-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Create Priority', ['ticket-priority-new-form-page'],
                KIXObjectType.TICKET_PRIORITY
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET_PRIORITY, formId);

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
