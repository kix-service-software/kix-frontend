import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize, Form,
    FormField, TicketProperty, ArticleProperty, DataType
} from '@kix/core/dist/model/';
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

    public async createFormularDefinitions(): Promise<void> {
        const formId = 'new-ticket-form';

        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const existingFormular = configurationService.getModuleConfiguration(formId, null);
        if (!existingFormular) {
            const fields = [];
            fields.push(new FormField("Ansprechpartner", TicketProperty.CUSTOMER_USER_ID, true, "Ansprechpartner"));
            fields.push(new FormField("Kunde", TicketProperty.CUSTOMER_ID, true, "Kunde"));
            fields.push(new FormField("Tickettyp", TicketProperty.TYPE_ID, true, "TIcketTyp"));
            fields.push(new FormField("Zuordnung zu Bereich / Queue", TicketProperty.QUEUE_ID, true, "Queue"));
            fields.push(new FormField("Betroffener Service", TicketProperty.SERVICE_ID, false, "Service"));
            fields.push(new FormField("SLA / Servicevertrag", TicketProperty.SLA_ID, false, "SLA"));
            fields.push(new FormField("Betreff", TicketProperty.TITLE, true, "Betreff"));
            fields.push(new FormField("Ticketbeschreibung", ArticleProperty.BODY, true, "Beschreibung"));
            fields.push(new FormField("Anlage", ArticleProperty.ATTACHMENT, false, "Anlagen"));
            fields.push(new FormField("Ticket verknüpfen mit", "LinkTicket", false, "Verknüpfungen"));
            fields.push(new FormField("Bearbeiter", TicketProperty.OWNER_ID, false, "Bearbeiter"));
            fields.push(new FormField("Verantwortlicher", TicketProperty.RESPONSIBLE_ID, false, "Verantwortlicher"));
            fields.push(new FormField("Priorität", TicketProperty.PRIORITY_ID, false, "Priorität"));
            fields.push(new FormField("Status des Tickets", TicketProperty.STATE_ID, false, "Status"));

            const form = new Form(formId, 'Neues Ticket', fields);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }

        configurationService.registerFormular(formId);
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
