import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize, Form,
    FormField, TicketProperty, ArticleProperty, DataType, FormContext, KIXObjectType
} from '@kix/core/dist/model';
import { TicketContextConfiguration } from '@kix/core/dist/browser/ticket';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "tickets";
    }

    public getDefaultConfiguration(): any {
        return new TicketContextConfiguration(this.getModuleId(), [], [], [], [], []);
    }

    public async createFormDefinitions(): Promise<void> {

        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const newTicketFormId = 'new-ticket-form';
        const newTicketExistingForm = configurationService.getModuleConfiguration(newTicketFormId, null);
        if (!newTicketExistingForm) {
            const fields = [];
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
            fields.push(new FormField("Priorität", TicketProperty.PRIORITY_ID, false, "Priorität"));
            fields.push(new FormField("Status des Tickets", TicketProperty.STATE_ID, false, "Status"));

            const form = new Form(newTicketFormId, 'Neues Ticket', fields);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET, newTicketFormId);

        const linkWithTicketFormId = 'link-with-ticket-form';
        const linkWithTicketExistingForm = configurationService.getModuleConfiguration(linkWithTicketFormId, null);
        if (!linkWithTicketExistingForm) {
            const fields = [];
            fields.push(new FormField("Ticketnummer", TicketProperty.TICKET_NUMBER, false, "Ticketnummer"));
            fields.push(new FormField("Titel", TicketProperty.TITLE, false, "Title"));
            fields.push(new FormField("Volltext", 'Fulltext', false, "Volltext"));
            fields.push(new FormField("Priorität", TicketProperty.PRIORITY_ID, false, "Priorität"));
            fields.push(new FormField("Status", TicketProperty.STATE_ID, false, "Status"));
            fields.push(new FormField("Typ", TicketProperty.TYPE_ID, false, "Typ"));
            fields.push(new FormField("Queue", TicketProperty.QUEUE_ID, false, "Queue"));
            fields.push(new FormField("Archiv", 'Archiv', false, "Archiv"));
            fields.push(new FormField("Service", TicketProperty.SERVICE_ID, false, "Service"));
            fields.push(new FormField("SLA", TicketProperty.SLA_ID, false, "SLA"));

            const form = new Form(linkWithTicketFormId, 'Verknüpfen mit ticket', fields);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }

        configurationService.registerForm(
            [FormContext.LINK, FormContext.SEARCH], KIXObjectType.TICKET, linkWithTicketFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
