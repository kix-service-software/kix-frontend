import { IConfigurationExtension } from '../../../core/extensions';
import {
    NewTicketPriorityDialogContext, NewTicketPriorityDialogContextConfiguration
} from '../../../core/browser/ticket';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, TicketPriorityProperty
} from '../../../core/model';
import { FormGroup } from '../../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketPriorityDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<NewTicketPriorityDialogContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new NewTicketPriorityDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-priority-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                "Name", TicketPriorityProperty.NAME, null, true, "Geben Sie einen Namen für die Priorität ein."
            ));
            fields.push(new FormField(
                "Icon", 'ICON', 'icon-input', false,
                "Wählen Sie ein Icon für die Priorität aus."
            ));
            fields.push(new FormField(
                "Kommentar", TicketPriorityProperty.COMMENT, 'text-area-input', false,
                "Geben Sie einen Kommentar für die Priorität ein.", null, null, null, null, null, null, null, 250
            ));
            fields.push(new FormField(
                "Gültigkeit", TicketPriorityProperty.VALID_ID, 'valid-input', true,
                "Legen Sie fest, ob die Priorität „gültig“, „ungültig“ oder „temporär ungültig“ ist.",
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Prioritätdaten', fields);

            const form = new Form(formId, 'Priorität hinzufügen', [group], KIXObjectType.TICKET_PRIORITY);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET_PRIORITY, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
