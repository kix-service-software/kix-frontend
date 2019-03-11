import { IConfigurationExtension } from '../../../core/extensions';
import { NewTicketTypeDialogContext, NewTicketTypeDialogContextConfiguration } from '../../../core/browser/ticket';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, TicketTypeProperty
} from '../../../core/model';
import { FormGroup } from '../../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketTypeDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<NewTicketTypeDialogContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new NewTicketTypeDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-type-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Name', TicketTypeProperty.NAME, null, true,
                'Translatable#Insert a type name.'
            ));
            fields.push(new FormField(
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Select an icon for this type.'
            ));
            fields.push(new FormField(
                'Translatable#Comment', TicketTypeProperty.COMMENT, 'text-area-input', false,
                'Translatable#Insert a comment for the type.', null, null, null, null, null, null, null, 250
            ));
            fields.push(new FormField(
                'Translatable#validity', TicketTypeProperty.VALID_ID, 'valid-input', true,
                'Translatable#Legen Sie fest, ob der Type „gültig“, „ungültig“ oder „temporär ungültig“ ist.',
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Translatable#Type Data', fields);

            const form = new Form(formId, 'Translatable#Create Type', [group], KIXObjectType.TICKET_TYPE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET_TYPE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
