/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewTicketDialogContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, TicketProperty,
    FormField, ArticleProperty, KIXObjectType, Form, FormContext, FormFieldValue, FormFieldOption,
    ObjectReferenceOptions, KIXObjectLoadingOptions, FilterCriteria,
    FilterDataType, FilterType, ObjectInformationWidgetSettings, ContactProperty, OrganisationProperty,
    KIXObjectProperty
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';

export class NewTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const organisationInfoSidebar =
            new ConfiguredWidget('20180524110915', new WidgetConfiguration(
                'object-information-widget', 'Translatable#Organisation', [],
                new ObjectInformationWidgetSettings(KIXObjectType.ORGANISATION, [
                    OrganisationProperty.NUMBER,
                    OrganisationProperty.NAME,
                    OrganisationProperty.URL,
                    OrganisationProperty.STREET,
                    OrganisationProperty.ZIP,
                    OrganisationProperty.CITY,
                    OrganisationProperty.COUNTRY
                ], true),
                false, false, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget('20180524110920', new WidgetConfiguration(
                'object-information-widget', 'Translatable#Contact', [],
                new ObjectInformationWidgetSettings(KIXObjectType.CONTACT, [
                    ContactProperty.LOGIN,
                    ContactProperty.TITLE,
                    ContactProperty.LASTNAME,
                    ContactProperty.FIRSTNAME,
                    ContactProperty.PRIMARY_ORGANISATION_ID,
                    ContactProperty.PHONE,
                    ContactProperty.MOBILE,
                    ContactProperty.EMAIL
                ], true),
                false, false, 'kix-icon-man-bubble', false)
            );

        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Text Modules', [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Translatable#Helptext_Textmodules_TicketCreate'
            },
            false, false, 'kix-icon-textblocks'
        ));

        const sidebars = ['20180524110915', '20180524110920', '20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [organisationInfoSidebar, contactInfoSidebar, helpWidget];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // tslint:disable:max-line-length
        const formId = 'new-ticket-form';
        const existingFormNewTicket = ConfigurationService.getInstance().getConfiguration(formId);
        if (!existingFormNewTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Contact', TicketProperty.CONTACT_ID, 'ticket-input-contact', true, 'Translatable#A contact is a person, filing a request for the customer. Enter at least 3 characters in order to get a suggestion list of already registered contacts. You may use „*“ as wildcard.',
                [
                    new FormFieldOption('SHOW_NEW_CONTACT', true)
                ]
            )
            );
            fields.push(new FormField('Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', true, 'Translatable#Choose a contact, customers will be assigned automatically.'));
            fields.push(new FormField('Translatable#Type', TicketProperty.TYPE_ID, 'ticket-input-type', true, 'Translatable#Ticket type is part of the classification of a ticket.'));
            fields.push(new FormField(
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'ticket-input-queue', true, 'Translatable#A queue is a classification system for requests, comparable to folders in a file system.')
            );
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
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
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
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
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
            fields.push(new FormField<number>(
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true, 'Translatable#Ticket status summarizes the tickets processing state.', null,
                new FormFieldValue(4)
            ));

            const group = new FormGroup('Translatable#Ticket Data', fields);

            const form = new Form(formId, 'Translatable#New Ticket', [group], KIXObjectType.TICKET);
            await ConfigurationService.getInstance().saveConfiguration(form.id, form);
        }
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET, formId);
    }

}

module.exports = (data, host, options) => {
    return new NewTicketDialogModuleExtension();
};
