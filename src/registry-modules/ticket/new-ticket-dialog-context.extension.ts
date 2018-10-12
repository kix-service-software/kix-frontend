import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    NewTicketDialogContext, NewTicketDialogContextConfiguration, TicketStateOptions, PendingTimeFormValue
} from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration, TicketProperty,
    FormField, ArticleProperty, KIXObjectType, Form, FormContext, FormFieldOption, FormFieldValue, FormFieldOptions
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';
import { AutocompleteOption, AutocompleteFormFieldOption } from '@kix/core/dist/browser/components';

export class NewTicketDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

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

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        // tslint:disable:max-line-length
        const formIdNewTicket = 'new-ticket-form';
        const existingFormNewTicket = configurationService.getModuleConfiguration(formIdNewTicket, null);
        if (!existingFormNewTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                "Ansprechpartner", TicketProperty.CUSTOMER_USER_ID, 'ticket-input-contact', true, "Ein Ansprechpartner ist ein Kontakt oder eine Person, die eine Anfrage im Kontext eines Kunden stellt. Bei der Eingabe von mindestens 3 Zeichen wird Ihnen eine Vorschlagsliste mit  bereits im System angelegten Ansprechpartner angezeigt. „***“ zeigt alle Einträge an.")
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
            fields.push(new FormField("Anlagen", ArticleProperty.ATTACHMENT, 'attachment-input', false, "Hier können Sie zusätzliche Dateien an das Ticket anhängen.  Ein Einfügen per Drag & Drop ist möglich. Bitte beachten Sie die maximale Dateigröße von 25 MB  pro Datei."));
            fields.push(new FormField(
                "Ticket verknüpfen mit", TicketProperty.LINK, 'link-input', false, "Verknüpfen Sie das Ticket mit einem anderen Ticket, Config Item oder einem FAQ-Artikel.")
            );
            fields.push(new FormField(
                "Bearbeiter", TicketProperty.OWNER_ID, 'ticket-input-owner', false, "Der Bearbeiter ist die Person, die für die Bearbeitung des Ticket  zuständig sein soll.")
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
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.TICKET, formIdNewTicket);

        // tslint:disable:max-line-length
        const formIdLinkWithTicket = 'link-ticket-search-form';
        const existingFormLinkWithTicket = configurationService.getModuleConfiguration(formIdLinkWithTicket, null);
        if (!existingFormLinkWithTicket) {
            const fulltextFields = [
                new FormField('', TicketProperty.FULLTEXT, null, false, 'Suche in folgenden Ticket-Feldern:  Ticketnummer, Titel / Betreff, Artikelinhalt, Von, An, CC')
            ];

            const fields: FormField[] = [];
            fields.push(new FormField('Ticketnummer', TicketProperty.TICKET_NUMBER, null, false, 'Geben Sie die Ticketnummer oder einen Teil der Ticketnummer ein (mindestens 1 Zeichen).'));
            fields.push(new FormField('Titel', TicketProperty.TITLE, null, false, 'Geben Sie den Titel oder Teile eines Tickettitels ein.'));
            fields.push(new FormField('Typ', TicketProperty.TYPE_ID, 'ticket-input-type', false, 'Suche nach Tickets des gewählten Typs.'));
            fields.push(new FormField('Queue', TicketProperty.QUEUE_ID, 'ticket-input-queue', false, 'Suche nach Tickets in der gewählten Queue.'));
            fields.push(new FormField<number>(
                'Priorität', TicketProperty.PRIORITY_ID, 'ticket-input-priority', false, 'Suche nach Tickets mit der gewählten Priorität.')
            );
            fields.push(new FormField<number>(
                'Status', TicketProperty.STATE_ID, 'ticket-input-state', false, 'Suche nach Tickets mit dem gewählten Status.')
            );
            fields.push(new FormField('Service', TicketProperty.SERVICE_ID, 'ticket-input-service', false, 'Suche nach Tickets, die mit dem gewählten Service verknüpft sind.'));
            fields.push(new FormField('SLA', TicketProperty.SLA_ID, 'ticket-input-sla', false, 'Suche nach Tickets, die mit dem gewählten SLA verknüpft sind.'));

            const fulltextGroup = new FormGroup('Volltext', fulltextFields, 'Oder');
            const attributeGroup = new FormGroup('Ticket-Attribute', fields);

            const form = new Form(
                formIdLinkWithTicket, 'Verknüpfen mit Ticket', [fulltextGroup, attributeGroup],
                KIXObjectType.TICKET, false, FormContext.LINK, null, true
            );
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
