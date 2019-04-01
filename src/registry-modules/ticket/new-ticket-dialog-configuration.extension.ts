import { IConfigurationExtension } from '../../core/extensions';
import {
    NewTicketDialogContext, NewTicketDialogContextConfiguration, PendingTimeFormValue
} from '../../core/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration, TicketProperty,
    FormField, ArticleProperty, KIXObjectType, Form, FormContext, FormFieldValue, FormFieldOption,
    ObjectReferenceOptions, KIXObjectLoadingOptions, FilterCriteria,
    UserProperty, FilterDataType, FilterType
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';

export class NewTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const customerInfoSidebar =
            new ConfiguredWidget('20180524110915', new WidgetConfiguration(
                'ticket-customer-info-widget', 'Translatable#Customer', [], {
                    groups: [
                        'Core Data', 'Adresse'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget('20180524110920', new WidgetConfiguration(
                'ticket-contact-info-widget', 'Translatable#Contact', [], {
                    groups: [
                        'Core Data', 'Kommunikation'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );

        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Text Modules', [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Translatable#<b>-- KIX Professional Feature--</b><p>To use the text modules available in your system, enter „::“ (colon colon). Then choose the text modules you want to use in the context menu. You can narrow down the key word selection manually by entering more text.</p>'
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
                'Translatable#Contact', TicketProperty.CUSTOMER_USER_ID, 'ticket-input-contact', true, 'Translatable#A contact is a person, filing a request for the customer. Enter at least 3 characters in order to get a suggestion list of already registered contacts. You may use „*“ as wildcard.')
            );
            fields.push(new FormField('Translatable#Customer', TicketProperty.CUSTOMER_ID, 'ticket-input-customer', true, 'Translatable#Choose a contact, customers will be assigned automatically.'));
            fields.push(new FormField('Translatable#Type', TicketProperty.TYPE_ID, 'ticket-input-type', true, 'Translatable#Ticket type is part of the classification of a ticket.'));
            fields.push(new FormField(
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'ticket-input-queue', true, 'Translatable#A queue is a classification system for requests, comparable to folders in a file system.')
            );
            fields.push(new FormField(
                'Translatable#Affected Service', TicketProperty.SERVICE_ID, 'ticket-input-service', false, 'Translatable#Service defines which content of the service catalog is being requested.')
            );
            fields.push(new FormField('Translatable#SLA / Service Level Agreement', TicketProperty.SLA_ID, 'ticket-input-sla', false, 'Translatable#SLA defines which target times are set for processing this ticket.'));
            fields.push(new FormField('Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true, 'Translatable#Channel'));
            fields.push(new FormField(
                'Translatable#Link Ticket with', TicketProperty.LINK, 'link-input', false, 'Translatable#Link this ticket item to an config item, an FAQ article or another ticket.')
            );
            fields.push(new FormField(
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false, 'Translatable#Owner is the user to which the ticket is assigned for processing.', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            null, [
                                new FilterCriteria(
                                    UserProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            ));
            fields.push(new FormField(
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false, 'Translatable#Responsible is the person in charge for this tickets processing, e.g. Service Owner, Key Account Manager. It does not need to be identical with the assigned ticket owner.', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            null, [
                                new FilterCriteria(
                                    UserProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            ));
            fields.push(new FormField<number>(
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'ticket-input-priority',
                true, 'Translatable#Priorities are used to mark a Ticket‘s urgency with different colours, so you can  categorize Tickets.',
                null, new FormFieldValue(3)
            ));
            fields.push(new FormField<PendingTimeFormValue>(
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true, 'Translatable#Ticket status summarizes the tickets processing state.', null,
                new FormFieldValue(new PendingTimeFormValue(4))
            ));

            const group = new FormGroup('Translatable#Ticket Data', fields);

            const form = new Form(formIdNewTicket, 'Translatable#New Ticket', [group], KIXObjectType.TICKET);
            await ConfigurationService.getInstance().saveModuleConfiguration(form.id, null, form);
        }
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET, formIdNewTicket);
    }

}

module.exports = (data, host, options) => {
    return new NewTicketDialogModuleExtension();
};
