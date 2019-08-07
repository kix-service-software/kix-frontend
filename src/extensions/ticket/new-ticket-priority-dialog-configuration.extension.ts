/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewTicketPriorityDialogContext } from '../../core/browser/ticket';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, TicketPriorityProperty, ContextConfiguration, KIXObjectProperty
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketPriorityDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-priority-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Name', TicketPriorityProperty.NAME, null, true,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Name'
            ));
            fields.push(new FormField(
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Icon'
            ));
            fields.push(new FormField(
                'Translatable#Comment', TicketPriorityProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Comment',
                null, null, null, null, null, null, null, 250
            ));
            fields.push(new FormField(
                'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                'Translatable#Helptext_Admin_Tickets_PriorityCreate_Valid',
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Translatable#Priority Data', fields);

            const form = new Form(formId, 'Translatable#Create Priority', [group], KIXObjectType.TICKET_PRIORITY);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET_PRIORITY, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
