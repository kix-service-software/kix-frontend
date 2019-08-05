/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewTicketStateDialogContext } from '../../core/browser/ticket';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form, FormContext, FormFieldValue, TicketStateProperty,
    FormFieldOption, ObjectReferenceOptions, ContextConfiguration, KIXObjectProperty,
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketStateDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-state-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Name', TicketStateProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Name'
            ));
            fields.push(new FormField(
                'Translatable#State Type', TicketStateProperty.TYPE_ID, 'object-reference-input',
                true, 'Translatable#Helptext_Admin_Tickets_StateCreate_Type', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false)
                ]
            ));
            fields.push(new FormField(
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Icon'
            ));
            fields.push(new FormField(
                'Translatable#Comment', TicketStateProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Comment', null, null, null, null, null, null, null, 250
            ));
            fields.push(new FormField(
                'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                'Translatable#Helptext_Admin_Tickets_StateCreate_Valid',
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Translatable#State Data', fields);

            const form = new Form(formId, 'Translatable#Create State', [group], KIXObjectType.TICKET_STATE);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET_STATE, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
