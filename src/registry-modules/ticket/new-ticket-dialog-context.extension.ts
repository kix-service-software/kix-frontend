import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    NewTicketDialogContext, NewTicketDialogContextConfiguration, TicketStateOptions, PendingTimeFormValue
} from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration, TicketProperty,
    FormField, ArticleProperty, KIXObjectType, Form, FormContext, FormFieldOption, FormFieldValue
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';

export class NewTicketDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const customerInfoSidebar =
            new ConfiguredWidget("20180524110915", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kunde", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget("20180524110920", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );
        const sidebars = ['20180524110915', '20180524110920'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [customerInfoSidebar, contactInfoSidebar];

        return new NewTicketDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formIdNewTicket = 'new-ticket-form';
        const existingFormNewTicket = configurationService.getModuleConfiguration(formIdNewTicket, null);
        if (!existingFormNewTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField("Ansprechpartner", TicketProperty.CUSTOMER_USER_ID, true, "Ansprechpartner"));
            fields.push(new FormField("Kunde", TicketProperty.CUSTOMER_ID, true, "Kunde"));
            fields.push(new FormField("Tickettyp", TicketProperty.TYPE_ID, true, "TicketTyp"));
            fields.push(new FormField("Zuordnung zu Bereich / Queue", TicketProperty.QUEUE_ID, true, "Queue"));
            fields.push(new FormField("Betroffener Service", TicketProperty.SERVICE_ID, false, "Service"));
            fields.push(new FormField("SLA / Servicevertrag", TicketProperty.SLA_ID, false, "SLA"));
            fields.push(new FormField("Betreff", TicketProperty.TITLE, true, "Betreff"));
            fields.push(new FormField("Ticketbeschreibung", ArticleProperty.BODY, true, "Beschreibung"));
            fields.push(new FormField("Anlage", ArticleProperty.ATTACHMENT, false, "Anlagen"));
            fields.push(new FormField("Ticket verknüpfen mit", TicketProperty.LINK, false, "Verknüpfungen"));
            fields.push(new FormField("Bearbeiter", TicketProperty.OWNER_ID, false, "Bearbeiter"));
            fields.push(new FormField("Verantwortlicher", TicketProperty.RESPONSIBLE_ID, false, "Verantwortlicher"));
            fields.push(new FormField<number>(
                "Priorität", TicketProperty.PRIORITY_ID, true, "Priorität", null, new FormFieldValue(3)
            ));
            fields.push(new FormField<PendingTimeFormValue>(
                "Status des Tickets",
                TicketProperty.STATE_ID,
                true, "Status",
                null,
                new FormFieldValue(new PendingTimeFormValue(4))
            ));

            const group = new FormGroup('Ticketdaten', fields);

            const form = new Form(formIdNewTicket, 'Neues Ticket', [group], KIXObjectType.TICKET);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET, formIdNewTicket);

        // TODO: Sollte entfernt werden, da es für Ticketsuche eigenständiges Formular gibt
        const formIdLinkWithTicket = 'link-with-ticket-form';
        const existingFormLinkWithTicket = configurationService.getModuleConfiguration(formIdLinkWithTicket, null);
        if (!existingFormLinkWithTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField("Volltext", TicketProperty.FULLTEXT, false, "Volltext"));
            fields.push(new FormField("Ticketnummer", TicketProperty.TICKET_NUMBER, false, "Ticketnummer"));
            fields.push(new FormField("Titel", TicketProperty.TITLE, false, "Title"));
            fields.push(new FormField("Typ", TicketProperty.TYPE_ID, false, "Typ"));
            fields.push(new FormField("Queue", TicketProperty.QUEUE_ID, false, "Queue"));
            fields.push(new FormField<number>("Priorität", TicketProperty.PRIORITY_ID, false, "Priorität"));
            fields.push(new FormField<number>("Status des Tickets", TicketProperty.STATE_ID, false, "Status"));
            fields.push(new FormField("Archiv", TicketProperty.ARCHIVE_FLAG, false, "Archiv"));
            fields.push(new FormField("Service", TicketProperty.SERVICE_ID, false, "Service"));
            fields.push(new FormField("SLA", TicketProperty.SLA_ID, false, "SLA"));

            const group = new FormGroup('Ticketattribute', fields);

            const form = new Form(formIdLinkWithTicket, 'Verknüpfen mit ticket', [group], KIXObjectType.TICKET, false);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }

        configurationService.registerForm(
            [FormContext.LINK], KIXObjectType.TICKET, formIdLinkWithTicket
        );
    }

}

module.exports = (data, host, options) => {
    return new NewTicketDialogModuleExtension();
};
