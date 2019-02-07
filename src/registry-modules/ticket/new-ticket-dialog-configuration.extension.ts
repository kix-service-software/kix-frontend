import { IConfigurationExtension } from '../../core/extensions';
import {
    NewTicketDialogContext, NewTicketDialogContextConfiguration, PendingTimeFormValue
} from '../../core/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration, TicketProperty,
    FormField, ArticleProperty, KIXObjectType, Form, FormContext, FormFieldOption, FormFieldValue, FormFieldOptions
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { AutocompleteOption, AutocompleteFormFieldOption } from '../../core/browser/components';
import { ConfigurationService } from '../../core/services';

export class NewTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const customerInfoSidebar =
            new ConfiguredWidget("20180524110915", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kunde", [], {
                    groups: [
                        'Stammdaten', 'Adresse'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget("20180524110920", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {
                    groups: [
                        'Stammdaten', 'Kommunikation'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );

        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Textbausteine', [], {
                // tslint:disable-next-line:max-line-length
                helpText: '<b>-- KIX Professional Feature --</b><p>Um die in Ihrem System verfügbaren Textbausteine zu nutzen, geben Sie "::" (Doppelpunkt Doppelpunkt) ein. Wählen Sie anschließend im Kontextmenü den gewünschten Textbaustein aus. Sie können die Auswahl anhand der Schlüsselworte manuell einschränken, in dem sie weiteren Text eingeben.</p>'
            },
            false, false, WidgetSize.BOTH, 'kix-icon-textblocks'
        ));

        const sidebars = ['20180524110915', '20180524110920', '20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [customerInfoSidebar, contactInfoSidebar, helpWidget];

        return new NewTicketDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // tslint:disable:max-line-length
        const formIdNewTicket = 'new-ticket-form';
        const existingFormNewTicket = ConfigurationService.getInstance().getModuleConfiguration(formIdNewTicket, null);
        if (!existingFormNewTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                "Ansprechpartner", TicketProperty.CUSTOMER_USER_ID, 'ticket-input-contact', true, "Ein Ansprechpartner ist ein Kontakt oder eine Person, die eine Anfrage im Kontext eines Kunden stellt. Bei der Eingabe von mindestens 3 Zeichen wird Ihnen eine Vorschlagsliste mit bereits im System angelegten Ansprechpartner angezeigt. „***“ zeigt alle Einträge an.")
            );
            fields.push(new FormField("Kunde", TicketProperty.CUSTOMER_ID, 'ticket-input-customer', true, "Kunden werden nach Auswahl eines Ansprechpartners automatisch zugewiesen."));
            fields.push(new FormField("Typ", TicketProperty.TYPE_ID, 'ticket-input-type', true, "Der Ticket-Typ dient zur Klassifizierung von Anfragen. "));
            fields.push(new FormField(
                "Zuordnung zu Bereich / Queue", TicketProperty.QUEUE_ID, 'ticket-input-queue', true, "Eine Queue ist ein Ordnungselement für Anfragen, vergleichbar mit Ordnern im Dateisystem eines PCs.")
            );
            fields.push(new FormField(
                "Betroffener Service", TicketProperty.SERVICE_ID, 'ticket-input-service', false, "Ein Service definiert, welche Leistung im Geschäftsprozess für das Ticket angefragt wird.")
            );
            fields.push(new FormField("SLA / Servicevertrag", TicketProperty.SLA_ID, 'ticket-input-sla', false, "Ein Servicevertrag (auch Service Level Agreement genannt) ist ein Vertrag zwischen einem Dienstleister und einem Kunden. Im Vertrag ist in der Regel festgehalten, in welchem Umfang die Dienstleistung und zu welcher Dienstgüte (Servicelevel) sie erbracht wird."));
            fields.push(new FormField("Betreff", TicketProperty.TITLE, null, true, "Der Betreff ist das Thema der Anfrage und bildet nach der Ticketerstellung den Titel eines Tickets."));
            fields.push(new FormField(
                "Ticketbeschreibung", ArticleProperty.BODY, 'rich-text-input', true, "Die Beschreibung beinhaltet alle relevanten Infos zur Anfrage. Bitte beschreiben Sie Ihr Anliegen so genau wie möglich.", [
                    new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                        new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                    ]))
                ])
            );
            fields.push(new FormField("Anlagen", ArticleProperty.ATTACHMENTS, 'attachment-input', false, "Hier können Sie zusätzliche Dateien an das Ticket anhängen. Ein Einfügen per Drag & Drop ist möglich. Bitte beachten Sie die maximale Dateigröße von 25 MB pro Datei."));
            fields.push(new FormField(
                "Ticket verknüpfen mit", TicketProperty.LINK, 'link-input', false, "Verknüpfen Sie das Ticket mit einem anderen Ticket, Config Item oder einem FAQ-Artikel.")
            );
            fields.push(new FormField(
                "Bearbeiter", TicketProperty.OWNER_ID, 'ticket-input-owner', false, "Der Bearbeiter ist die Person, die für die Bearbeitung des Ticket zuständig sein soll.")
            );
            fields.push(new FormField(
                "Verantwortlicher", TicketProperty.RESPONSIBLE_ID, 'ticket-input-owner', false, "Der Verantwortliche ist die Person, die dafür verantwortlich ist, dass das Ticket gelöst wird (kann mit Bearbeiter identisch sein).")
            );
            fields.push(new FormField<number>(
                "Priorität", TicketProperty.PRIORITY_ID, 'ticket-input-priority',
                true, "Prioritäten kennzeichnen farblich unterschiedliche Dringlichkeiten und können zur Kategorisierung von Tickets genutzt werden.",
                null, new FormFieldValue(3)
            ));
            fields.push(new FormField<PendingTimeFormValue>(
                "Status", TicketProperty.STATE_ID, 'ticket-input-state', true, "Der Status definiert, in welchem Bearbeitungszustand sich ein Ticket befindet.", null,
                new FormFieldValue(new PendingTimeFormValue(4))
            ));

            const group = new FormGroup('Ticketdaten', fields);

            const form = new Form(formIdNewTicket, 'Neues Ticket', [group], KIXObjectType.TICKET);
            await ConfigurationService.getInstance().saveModuleConfiguration(form.id, null, form);
        }
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET, formIdNewTicket);
    }

}

module.exports = (data, host, options) => {
    return new NewTicketDialogModuleExtension();
};
