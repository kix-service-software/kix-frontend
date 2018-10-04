import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    EditTicketDialogContextConfiguration, EditTicketDialogContext, PendingTimeFormValue
} from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, FormField, TicketProperty, ArticleProperty,
    Form, KIXObjectType, FormContext, ConfiguredWidget, WidgetConfiguration,
    FormFieldOption, FormFieldOptions, WidgetSize
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';
import { AutocompleteFormFieldOption, AutocompleteOption } from '@kix/core/dist/browser/components';

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

        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Textbausteine', [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Um die in Ihrem System verfügbaren Textbausteine zu nutzen, geben Sie "::" (Doppelpunkt Doppelpunkt) ein. Wählen Sie anschließend im Kontextmenü den gewünschten Textbaustein aus. Sie können die Auswahl anhand der Schlüsselworte manuell einschränken, in dem sie weiteren Text eingeben.'
            }, false, false, WidgetSize.BOTH, 'kix-icon-textblocks'
        ));

        const sidebars = ['20180524110915', '20180524110920', '20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [customerInfoSidebar, contactInfoSidebar, helpWidget];

        return new EditTicketDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formIdEditTicket = 'edit-ticket-form';
        const existingFormEditTicket = configurationService.getModuleConfiguration(formIdEditTicket, null);
        if (!existingFormEditTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField("Titel", TicketProperty.TITLE, null, true, "Geben Sie einen Titel für das Ticket ein"));
            fields.push(new FormField(
                "Ansprechpartner", TicketProperty.CUSTOMER_USER_ID, 'ticket-input-contact', true, "Ein Ansprechpartner ist ein Kontakt oder eine Person, die eine Anfrage im Kontext eines Kunden stellt. Geben Sie mindestens 3 Zeichen ein, um nach einem Ansprechpartner zu suchen und wählen Sie einen Ansprechpartner für das Ticket aus der Liste. „***“ zeigt alle Einträge an. (Pflichtfeld)"
            ));
            fields.push(new FormField("Kunde", TicketProperty.CUSTOMER_ID, 'ticket-input-customer', true, "Der oder die Kunden werden nach Auswahl eines Ansprechpartners automatisch zugewiesen. (Pflichtfeld)"));
            fields.push(new FormField("Typ", TicketProperty.TYPE_ID, 'ticket-input-type', true, "Der Ticket-Typ klassifiziert den Geschäftsprozess einer Anfrage. Wählen Sie einen Ticket-Ttyp aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Pflichtfeld)"));
            fields.push(new FormField(
                "Zuordnung zu Bereich / Queue", TicketProperty.QUEUE_ID, 'ticket-input-queue', true, "Eine Queue ist ein Ordnungselement für Anfragen, vergleichbar mit Ordnern im Dateisystem eines Computers. Wählen Sie  eine Queue aus der Liste, der das Ticket zugeordnet werden soll. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Pflichtfeld)"
            ));
            fields.push(new FormField(
                "Betroffener Service", TicketProperty.SERVICE_ID, 'ticket-input-service', false, "Ein Service definiert, welche Leistung im Geschäftsprozess für eine Anfrage/Ticket angefragt wird. Wählen Sie einen Service aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Optional)"
            ));
            fields.push(new FormField("SLA / Servicevertrag", TicketProperty.SLA_ID, 'ticket-input-sla', false, "Ein Servicevertrag definiert, in welcher Zeit auf eine Anfrage/ein Ticket reagiert werden muss. Wählen Sie einen SLA/Servicevertrag aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Optional)"));

            fields.push(new FormField("Artikelbetreff", ArticleProperty.SUBJECT, null, true, "Geben Sie einen Betreff für das Ticket ein. Der Betreff bildet nach der Ticketerstellung zusammen mit der Ticketnummer den Titel eines Tickets. (Pflichtfeld)"));
            fields.push(new FormField("Artikelinhalt", ArticleProperty.BODY, 'rich-text-input', true, "Beschreiben Sie Ihr Anliegen so genau wie möglich. (Pflichtfeld)", [
                new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                    new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                ]))
            ]));

            fields.push(new FormField("Anlage", ArticleProperty.ATTACHMENT, 'attachment-input', false, "Wählen Sie hier ggf. Dateien (Dateigröße maximal 25 MB  pro Datei) aus, die Sie an das Ticket anhängen möchten. Einfügen per Drag & Drop ist möglich."));
            fields.push(new FormField(
                "Bearbeiter", TicketProperty.OWNER_ID, 'ticket-input-owner', false, "Der Bearbeiter ist die Person, die für die Bearbeitung des Ticket  zuständig ist. Wählen Sie einen Bearbeiter für das Ticket aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Optional)"
            ));
            fields.push(new FormField(
                "Verantwortlicher", TicketProperty.RESPONSIBLE_ID, 'ticket-input-owner', false, "Der Verantwortliche ist die Person, die dafür verantwortlich ist, dass das Ticket gelöst wird (kann mit Bearbeiter identisch sein). Wählen Sie einen Verantwortlichen für das Ticket aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Optional)"
            ));
            fields.push(new FormField<number>(
                "Priorität", TicketProperty.PRIORITY_ID, 'ticket-input-priority', true, "Prioritäten kennzeichnen farblich unterschiedliche Dringlichkeiten und können zur Kategorisierung von Tickets genutzt werden. Wählen Sie die Priorität für das Ticket aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Pflichtfeld)"
            ));
            fields.push(new FormField<PendingTimeFormValue>(
                "Status", TicketProperty.STATE_ID, 'ticket-input-state', true, "Der Status definiert, in welchem Bearbeitungszustand sich ein Ticket befindet.  Wählen Sie den Status für das Ticket aus der Liste. Sie können durch Texteingabe nach Einträgen in der Liste filtern. (Pflichtfeld)"
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
