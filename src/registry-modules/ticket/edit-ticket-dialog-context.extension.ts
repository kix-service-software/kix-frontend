import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    EditTicketDialogContextConfiguration, EditTicketDialogContext, PendingTimeFormValue
} from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, FormField, TicketProperty, ArticleProperty,
    Form, KIXObjectType, FormContext, ConfiguredWidget, WidgetConfiguration
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';

export class EditTicketDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return EditTicketDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const customerInfoSidebar =
            new ConfiguredWidget("20180524110915", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kunde", [], {},
                false, false, null, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget("20180524110920", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {},
                false, false, null, 'kix-icon-man-bubble', false)
            );
        const sidebars = ['20180524110915', '20180524110920'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [customerInfoSidebar, contactInfoSidebar];

        return new EditTicketDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formIdEditTicket = 'edit-ticket-form';
        const existingFormEditTicket = configurationService.getModuleConfiguration(formIdEditTicket, null);
        if (!existingFormEditTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField("Titel", TicketProperty.TITLE, null, true, "Titel"));
            fields.push(new FormField(
                "Ansprechpartner", TicketProperty.CUSTOMER_USER_ID, 'ticket-input-contact', true, "Ansprechpartner"
            ));
            fields.push(new FormField("Kunde", TicketProperty.CUSTOMER_ID, 'ticket-input-customer', true, "Kunde"));
            fields.push(new FormField("Tickettyp", TicketProperty.TYPE_ID, 'ticket-input-type', true, "TicketTyp"));
            fields.push(new FormField(
                "Zuordnung zu Bereich / Queue", TicketProperty.QUEUE_ID, 'ticket-input-queue', true, "Queue"
            ));
            fields.push(new FormField(
                "Betroffener Service", TicketProperty.SERVICE_ID, 'ticket-input-service', false, "Service"
            ));
            fields.push(new FormField("SLA / Servicevertrag", TicketProperty.SLA_ID, 'ticket-input-sla', false, "SLA"));

            fields.push(new FormField("Artikelbetreff", ArticleProperty.SUBJECT, null, true, "Artikelbetreff"));
            fields.push(new FormField("Artikelinhalt", ArticleProperty.BODY, 'rich-text-input', true, "Artikelinhalt"));

            fields.push(new FormField("Anlage", ArticleProperty.ATTACHMENT, 'attachment-input', false, "Anlagen"));
            fields.push(new FormField(
                "Bearbeiter", TicketProperty.OWNER_ID, 'ticket-input-owner', false, "Bearbeiter"
            ));
            fields.push(new FormField(
                "Verantwortlicher", TicketProperty.RESPONSIBLE_ID, 'ticket-input-owner', false, "Verantwortlicher"
            ));
            fields.push(new FormField<number>(
                "Priorität", TicketProperty.PRIORITY_ID, 'ticket-input-priority', true, "Priorität"
            ));
            fields.push(new FormField<PendingTimeFormValue>(
                "Status des Tickets", TicketProperty.STATE_ID, 'ticket-input-state', true, "Status"
            ));

            const group = new FormGroup('Ticketdaten', fields);

            const form = new Form(
                formIdEditTicket, 'Ticket bearbeiten', [group],
                KIXObjectType.TICKET, true, FormContext.EDIT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.TICKET, formIdEditTicket);
    }

}

module.exports = (data, host, options) => {
    return new EditTicketDialogModuleExtension();
};
