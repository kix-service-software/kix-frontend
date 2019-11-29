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
    ArticleProperty, KIXObjectType, FormContext, FormFieldValue, FormFieldOption, ObjectReferenceOptions,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, ContactProperty, OrganisationProperty,
    KIXObjectProperty, QueueProperty, ObjectInformationWidgetConfiguration, HelpWidgetConfiguration,
    ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class NewTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const organisationInformation = new ObjectInformationWidgetConfiguration(
            'ticket-new-dialog-organisation-information', 'Organisation Information',
            ConfigurationType.ObjectInformation,
            KIXObjectType.ORGANISATION,
            [
                OrganisationProperty.NUMBER,
                OrganisationProperty.NAME,
                OrganisationProperty.URL,
                OrganisationProperty.STREET,
                OrganisationProperty.ZIP,
                OrganisationProperty.CITY,
                OrganisationProperty.COUNTRY
            ], true
        );
        configurations.push(organisationInformation);

        const organisationInfoSidebar = new WidgetConfiguration(
            'ticket-new-dialog-organisation-widget', 'Organisation Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Organisation', [],
            new ConfigurationDefinition(
                'ticket-new-dialog-organisation-information', ConfigurationType.ObjectInformation
            ),
            null, false, false, 'kix-icon-man-house', false
        );
        configurations.push(organisationInfoSidebar);

        const contactInformation = new ObjectInformationWidgetConfiguration(
            'ticket-new-dialog-contact-information', 'Contact Information',
            ConfigurationType.ObjectInformation,
            KIXObjectType.CONTACT,
            [
                ContactProperty.LOGIN,
                ContactProperty.TITLE,
                ContactProperty.LASTNAME,
                ContactProperty.FIRSTNAME,
                ContactProperty.PRIMARY_ORGANISATION_ID,
                ContactProperty.PHONE,
                ContactProperty.MOBILE,
                ContactProperty.EMAIL
            ], true
        );
        configurations.push(contactInformation);

        const contactInfoSidebar = new WidgetConfiguration(
            'ticket-new-dialog-contact-widget', 'Contact Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Contact', [],
            new ConfigurationDefinition('ticket-new-dialog-contact-information', ConfigurationType.ObjectInformation),
            null, false, false, 'kix-icon-man-bubble', false
        );
        configurations.push(contactInfoSidebar);

        const helpSettings = new HelpWidgetConfiguration(
            'ticket-new-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Textmodules_TicketCreate', null
        );
        configurations.push(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'ticket-new-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Text Modules', [],
            new ConfigurationDefinition('ticket-new-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-textblocks'
        );
        configurations.push(helpWidget);

        const dialogWidget = new WidgetConfiguration(
            'ticket-new-dialog-widget', 'New Ticket Dialog', ConfigurationType.Widget,
            'new-ticket-dialog', 'Translatable#New Ticket', [], null, null,
            false, false, 'kix-icon-new-ticket'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket New Dialog', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget(
                        'ticket-new-dialog-organisation-widget', 'ticket-new-dialog-organisation-widget'
                    ),
                    new ConfiguredWidget('ticket-new-dialog-contact-widget', 'ticket-new-dialog-contact-widget'),
                    new ConfiguredWidget('ticket-new-dialog-help-widget', 'ticket-new-dialog-help-widget')
                ],
                [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-new-dialog-widget', 'ticket-new-dialog-widget', KIXObjectType.TICKET, ContextMode.CREATE
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'ticket-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-contact',
                'Translatable#Contact', TicketProperty.CONTACT_ID, 'ticket-input-contact', true,
                'Translatable#Helptext_Tickets_TicketCreate_Contact',
                [
                    new FormFieldOption('SHOW_NEW_CONTACT', true)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-organisation',
                'Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', true,
                'Translatable#Helptext_Tickets_TicketCreate_Organisation'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-type',
                'Translatable#Type', TicketProperty.TYPE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Type',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_TYPE),

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
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-queue',
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Queue',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),

                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ],
                            null, null,
                            [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
                            [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-channel',
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Channel'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-links',
                'Translatable#Link Ticket with', TicketProperty.LINK, 'link-input', false,
                'Translatable#Helptext_Tickets_TicketCreate_Links'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-owner',
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketCreate_Owner',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ], undefined, undefined, undefined, undefined,
                            [
                                ['requiredPermission', 'TicketRead,TicketUpdate']
                            ]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-responsible',
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketCreate_Responsible',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ], undefined, undefined, undefined, undefined,
                            [
                                ['requiredPermission', 'TicketRead,TicketUpdate']
                            ]
                        )
                    )
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-priority',
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Priority',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_PRIORITY),

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
                ], new FormFieldValue(3)
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-state',
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true,
                'Translatable#Helptext_Tickets_TicketCreate_State', null,
                new FormFieldValue(2)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-new-form-group-data', 'Translatable#Ticket Data',
                [
                    'ticket-new-form-field-contact',
                    'ticket-new-form-field-organisation',
                    'ticket-new-form-field-type',
                    'ticket-new-form-field-queue',
                    'ticket-new-form-field-channel',
                    'ticket-new-form-field-links',
                    'ticket-new-form-field-owner',
                    'ticket-new-form-field-responsible',
                    'ticket-new-form-field-priority',
                    'ticket-new-form-field-state',
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-new-form-page', 'Translatable#New Ticket',
                ['ticket-new-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Ticket', ['ticket-new-form-page'], KIXObjectType.TICKET
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new NewTicketDialogModuleExtension();
};
