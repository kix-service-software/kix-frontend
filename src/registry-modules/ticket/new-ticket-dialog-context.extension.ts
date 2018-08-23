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
            fields.push(new FormField(
                "Ansprechpartner", TicketProperty.CUSTOMER_USER_ID, 'ticket-input-contact', true, "Ansprechpartner")
            );
            fields.push(new FormField("Kunde", TicketProperty.CUSTOMER_ID, 'ticket-input-customer', true, "Kunde"));
            fields.push(new FormField("Tickettyp", TicketProperty.TYPE_ID, 'ticket-input-type', true, "TicketTyp"));
            fields.push(new FormField(
                "Zuordnung zu Bereich / Queue", TicketProperty.QUEUE_ID, 'ticket-input-queue', true, "Queue")
            );
            fields.push(new FormField(
                "Betroffener Service", TicketProperty.SERVICE_ID, 'ticket-input-service', false, "Service")
            );
            fields.push(new FormField("SLA / Servicevertrag", TicketProperty.SLA_ID, 'ticket-input-sla', false, "SLA"));
            fields.push(new FormField("Betreff", TicketProperty.TITLE, null, true, "Betreff"));
            fields.push(new FormField(
                "Ticketbeschreibung", ArticleProperty.BODY, 'rich-text-input', true, "Beschreibung")
            );
            fields.push(new FormField("Anlage", ArticleProperty.ATTACHMENT, 'attachment-input', false, "Anlagen"));
            fields.push(new FormField(
                "Ticket verknüpfen mit", TicketProperty.LINK, 'link-input', false, "Verknüpfungen")
            );
            fields.push(new FormField(
                "Bearbeiter", TicketProperty.OWNER_ID, 'ticket-input-owner', false, "Bearbeiter")
            );
            fields.push(new FormField(
                "Verantwortlicher", TicketProperty.RESPONSIBLE_ID, 'ticket-input-owner', false, "Verantwortlicher")
            );
            fields.push(new FormField<number>(
                "Priorität", TicketProperty.PRIORITY_ID, 'ticket-input-priority',
                true, "Priorität", null, new FormFieldValue(3)
            ));
            fields.push(new FormField<PendingTimeFormValue>(
                "Status des Tickets", TicketProperty.STATE_ID, 'ticket-input-state', true, "Status", null,
                new FormFieldValue(new PendingTimeFormValue(4))
            ));

            const group = new FormGroup('Ticketdaten', fields);

            const form = new Form(formIdNewTicket, 'Neues Ticket', [group], KIXObjectType.TICKET);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET, formIdNewTicket);

        const formIdLinkWithTicket = 'link-ticket-search-form';
        const existingFormLinkWithTicket = configurationService.getModuleConfiguration(formIdLinkWithTicket, null);
        if (!existingFormLinkWithTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField("Volltext", TicketProperty.FULLTEXT, null, false, "Volltext"));
            fields.push(new FormField("Ticketnummer", TicketProperty.TICKET_NUMBER, null, false, "Ticketnummer"));
            fields.push(new FormField("Titel", TicketProperty.TITLE, null, false, "Title"));
            fields.push(new FormField("Typ", TicketProperty.TYPE_ID, 'ticket-input-type', false, "Typ"));
            fields.push(new FormField("Queue", TicketProperty.QUEUE_ID, 'ticket-input-queue', false, "Queue"));
            fields.push(new FormField<number>(
                "Priorität", TicketProperty.PRIORITY_ID, 'ticket-input-priority', false, "Priorität")
            );
            fields.push(new FormField<number>(
                "Status des Tickets", TicketProperty.STATE_ID, 'ticket-input-priority', false, "Status")
            );
            fields.push(new FormField(
                "Archiv", TicketProperty.ARCHIVE_FLAG, 'ticket-input-archive-search', false, "Archiv")
            );
            fields.push(new FormField("Service", TicketProperty.SERVICE_ID, 'ticket-input-service', false, "Service"));
            fields.push(new FormField("SLA", TicketProperty.SLA_ID, 'ticket-input-sla', false, "SLA"));

            const group = new FormGroup('Ticketattribute', fields);

            const form = new Form(formIdLinkWithTicket, 'Verknüpfen mit Ticket', [group], KIXObjectType.TICKET, false);
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
