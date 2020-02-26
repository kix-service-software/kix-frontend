/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ModuleConfigurationService } from "../../server/services/configuration";
import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { NewTicketDialogContext } from "./webapp/core";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { ObjectInformationWidgetConfiguration } from "../../model/configuration/ObjectInformationWidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationDefinition } from "../../model/configuration/ConfigurationDefinition";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ConfiguredWidget } from "../../model/configuration/ConfiguredWidget";
import { ConfiguredDialogWidget } from "../../model/configuration/ConfiguredDialogWidget";
import { ContextMode } from "../../model/ContextMode";
import { FormFieldConfiguration } from "../../model/configuration/FormFieldConfiguration";
import { TicketProperty } from "./model/TicketProperty";
import { FormFieldOption } from "../../model/configuration/FormFieldOption";
import { ObjectReferenceOptions } from "../../modules/base-components/webapp/core/ObjectReferenceOptions";
import { KIXObjectLoadingOptions } from "../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../model/FilterCriteria";
import { KIXObjectProperty } from "../../model/kix/KIXObjectProperty";
import { SearchOperator } from "../search/model/SearchOperator";
import { FilterDataType } from "../../model/FilterDataType";
import { FilterType } from "../../model/FilterType";
import { QueueProperty } from "./model/QueueProperty";
import { ArticleProperty } from "./model/ArticleProperty";
import { FormFieldValue } from "../../model/configuration/FormFieldValue";
import { FormGroupConfiguration } from "../../model/configuration/FormGroupConfiguration";
import { FormPageConfiguration } from "../../model/configuration/FormPageConfiguration";
import { FormConfiguration } from "../../model/configuration/FormConfiguration";
import { FormContext } from "../../model/configuration/FormContext";
import { OrganisationProperty } from "../customer/model/OrganisationProperty";
import { UserProperty } from "../user/model/UserProperty";
import { ContactProperty } from "../customer/model/ContactProperty";
import { ObjectReferenceWidgetConfiguration } from "../base-components/webapp/core/ObjectReferenceWidgetConfiguration";
import { DefaultColumnConfiguration } from "../../model/configuration/DefaultColumnConfiguration";


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
                OrganisationProperty.NUMBER,
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
                UserProperty.USER_LOGIN,
                ContactProperty.TITLE,
                ContactProperty.FIRSTNAME,
                ContactProperty.LASTNAME,
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


        const ticketsForAssetsWidget = new WidgetConfiguration(
            'ticket-new-dialog-object-reference-widget', 'Tickets for Assets', ConfigurationType.Widget,
            'referenced-objects-widget', 'Translatable#Tickets for Assets', [], null,
            new ObjectReferenceWidgetConfiguration(
                'ticket-details-object-reference-widget-config', 'Tickets for Assets',
                'TicketsForAssetsHandler',
                {
                    properties: [
                        'DynamicFields.AffactedAsset'
                    ]
                },
                [
                    new DefaultColumnConfiguration(
                        null, null, null, TicketProperty.TITLE, true, false, true, false, 130, true, false
                    ),
                    new DefaultColumnConfiguration(
                        null, null, null, TicketProperty.TYPE_ID, false, true, true, false, 50, true, false
                    ),
                ]
            ),
            false, false, 'kix-icon-ticket'
        );
        configurations.push(ticketsForAssetsWidget);

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
                    new ConfiguredWidget(
                        'ticket-new-dialog-object-reference-widget', 'ticket-new-dialog-object-reference-widget'
                    )
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
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TICKET, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new NewTicketDialogModuleExtension();
};
