import { IConfigurationExtension } from '../../../core/extensions';
import {
    NewTicketStateDialogContext, NewTicketStateDialogContextConfiguration
} from '../../../core/browser/ticket';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, TicketStateProperty, FormFieldOption, ObjectReferenceOptions,
    FormFieldOptions, InputFieldTypes
} from '../../../core/model';
import { FormGroup } from '../../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketStateDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<NewTicketStateDialogContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new NewTicketStateDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-state-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Name', TicketStateProperty.NAME, null, true,
                'Translatable#Insert a state name.'
            ));
            fields.push(new FormField(
                'Translatable#Statustyp', TicketStateProperty.TYPE_ID, 'object-reference-input',
                true, 'Translatable#Select a state type for this state.', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false)
                ]
            ));
            fields.push(new FormField(
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Select an icon for this state.'
            ));
            fields.push(new FormField(
                'Translatable#Comment', TicketStateProperty.COMMENT, 'text-area-input', false,
                'Translatable#Insert a comment for the state.', null, null, null, null, null, null, null, 250
            ));
            fields.push(new FormField(
                'Translatable#Validity', TicketStateProperty.VALID_ID, 'valid-input', true,
                'Translatable#Set the state as „valid“, „invalid (temporarily)“, or „invalid“.',
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Translatable#State Data', fields);

            const form = new Form(formId, 'Translatable#Create State', [group], KIXObjectType.TICKET_STATE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET_STATE, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
