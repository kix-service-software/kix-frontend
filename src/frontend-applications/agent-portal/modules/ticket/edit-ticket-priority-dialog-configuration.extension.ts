/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditTicketPriorityDialogContext } from './webapp/core';
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

import { ModuleConfigurationService } from '../../server/services/configuration';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketPriorityDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'ticket-priority-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Priority', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Priority Edit Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-priority-edit-dialog-widget', 'ticket-priority-edit-dialog-widget',
                        KIXObjectType.TICKET_PRIORITY, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'ticket-priority-edit-form';

        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-name',
                'Translatable#Name', TicketPriorityProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Name'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Icon'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-priority-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Tickets_PriorityCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
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

        configurations.push(
            new FormPageConfiguration(
                'ticket-priority-edit-form-page', 'Translatable#Edit Priority',
                ['ticket-priority-edit-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Priority', ['ticket-priority-edit-form-page'],
                KIXObjectType.TICKET_PRIORITY, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.EDIT], KIXObjectType.TICKET_PRIORITY, formId
        );
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
