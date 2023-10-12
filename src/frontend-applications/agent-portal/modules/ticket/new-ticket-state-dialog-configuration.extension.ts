/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewTicketStateDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { TicketStateProperty } from './model/TicketStateProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';

import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketStateDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'ticket-state-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New State', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket State New Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-state-new-dialog-widget', 'ticket-state-new-dialog-widget',
                        KIXObjectType.TICKET_STATE, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'ticket-state-new-form';

        configurations.push(
            new FormFieldConfiguration(
                'ticket-state-new-form-field-name',
                'Translatable#Name', TicketStateProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-state-new-form-field-type',
                'Translatable#State Type', TicketStateProperty.TYPE_ID, 'object-reference-input',
                true, 'Translatable#Helptext_Admin_Tickets_StateCreate_Type',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-state-new-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Icon'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-state-new-form-field-comment',
                'Translatable#Comment', TicketStateProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-state-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_StateCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-state-new-form-group-data', 'Translatable#State Data',
                [
                    'ticket-state-new-form-field-name',
                    'ticket-state-new-form-field-type',
                    'ticket-state-new-form-field-icon',
                    'ticket-state-new-form-field-comment',
                    'ticket-state-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-state-new-form-page', 'Translatable#Create State',
                ['ticket-state-new-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Create State', ['ticket-state-new-form-page'], KIXObjectType.TICKET_STATE
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET_STATE, formId);
        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
