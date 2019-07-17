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
                'Translatable#Insert a priority name.'
            ));
            fields.push(new FormField(
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Select an icon for this priority.'
            ));
            fields.push(new FormField(
                'Translatable#Comment', TicketPriorityProperty.COMMENT, 'text-area-input', false,
                'Translatable#Insert a comment for the priority.',
                null, null, null, null, null, null, null, 250
            ));
            fields.push(new FormField(
                'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                'Translatable#Set the priority as „valid“, „invalid (temporarily)“, or „invalid“.',
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
