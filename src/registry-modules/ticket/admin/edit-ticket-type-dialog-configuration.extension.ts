import { IConfigurationExtension } from '@kix/core/dist/extensions';
import { EditTicketTypeDialogContext, EditTicketTypeDialogContextConfiguration } from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, TicketTypeProperty
} from '@kix/core/dist/model';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';
import { ConfigurationService } from '@kix/core/dist/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketTypeDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new EditTicketTypeDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-ticket-type-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                "Name", TicketTypeProperty.NAME, null, true, "Geben Sie einen Namen für den Typ ein."
            ));
            fields.push(new FormField(
                "Kommentar", TicketTypeProperty.COMMENT, 'text-area-input',
                false, "Geben Sie einen Kommentar für den Typ ein."
            ));
            fields.push(new FormField(
                "Gültigkeit", TicketTypeProperty.VALID_ID, 'valid-input', true,
                "Legen Sie fest, ob der Typ „gültig“, „ungültig“ oder „temporär ungültig“ ist.",
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('Typdaten', fields);

            const form = new Form(formId, 'Typ bearbeiten', [group], KIXObjectType.TICKET_TYPE, true, FormContext.EDIT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.TICKET_TYPE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
