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

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-state-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                "Name", TicketStateProperty.NAME, null, true, "Geben Sie einen Namen für den Status ein."
            ));
            fields.push(new FormField(
                "Statustyp", TicketStateProperty.TYPE_ID, 'object-reference-input',
                true, "Wählen Sie den Statustyp für den Status aus.", [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false)
                ]
            ));
            fields.push(new FormField(
                "Icon", 'ICON', 'icon-input', false,
                "Wählen Sie ein Icon für den Status aus."
            ));
            fields.push(new FormField(
                "Kommentar", TicketStateProperty.COMMENT, 'text-area-input', false,
                "Geben Sie einen Kommentar für den Status ein.", null, null, null, null, null, null, null, 250
            ));
            fields.push(new FormField(
                "Gültigkeit", TicketStateProperty.VALID_ID, 'valid-input', true,
                "Legen Sie fest, ob der Status „gültig“, „ungültig“ oder „temporär ungültig“ ist.",
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Statusdaten', fields);

            const form = new Form(formId, 'Status hinzufügen', [group], KIXObjectType.TICKET_STATE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET_STATE, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
