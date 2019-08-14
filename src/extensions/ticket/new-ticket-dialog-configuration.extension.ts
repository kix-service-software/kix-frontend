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
                'Translatable#Contact', TicketProperty.CONTACT_ID, 'ticket-input-contact', true, 'Translatable#Helptext_Tickets_TicketCreate_Contact',
                [
                    new FormFieldOption('SHOW_NEW_CONTACT', true)
                ]
            )
            );
            fields.push(new FormField('Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', true, 'Translatable#Helptext_Tickets_TicketCreate_Organisation'));
            fields.push(new FormField('Translatable#Type', TicketProperty.TYPE_ID, 'ticket-input-type', true, 'Translatable#Helptext_Tickets_TicketCreate_Type'));
            fields.push(new FormField(
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'ticket-input-queue', true, 'Translatable#Helptext_Tickets_TicketCreate_Queue')
            );
            fields.push(new FormField('Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true, 'Translatable#Helptext_Tickets_TicketCreate_Channel'));
            fields.push(new FormField(
                'Translatable#Link Ticket with', TicketProperty.LINK, 'link-input', false, 'Translatable#Helptext_Tickets_TicketCreate_Links')
            );
            fields.push(new FormField(
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false, 'Translatable#Helptext_Tickets_TicketCreate_Owner', [
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
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false, 'Translatable#Helptext_Tickets_TicketCreate_Responsible', [
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
                true, 'Translatable#Helptext_Tickets_TicketCreate_Priority',
                null, new FormFieldValue(3)
            ));
            fields.push(new FormField<number>(
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true, 'Translatable#Helptext_Tickets_TicketCreate_State', null,
                new FormFieldValue(2)
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
