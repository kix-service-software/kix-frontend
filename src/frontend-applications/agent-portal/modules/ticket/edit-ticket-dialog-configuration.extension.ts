/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { EditTicketDialogContext } from "./webapp/core";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { ObjectInformationWidgetConfiguration } from "../../model/configuration/ObjectInformationWidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationDefinition } from "../../model/configuration/ConfigurationDefinition";
import { HelpWidgetConfiguration } from "../../model/configuration/HelpWidgetConfiguration";
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
import { FormGroupConfiguration } from "../../model/configuration/FormGroupConfiguration";
import { FormPageConfiguration } from "../../model/configuration/FormPageConfiguration";
import { FormConfiguration } from "../../model/configuration/FormConfiguration";
import { FormContext } from "../../model/configuration/FormContext";
import { ModuleConfigurationService } from "../../server/services/configuration";
import { UserProperty } from "../user/model/UserProperty";
import { ContactProperty } from "../customer/model/ContactProperty";
import { OrganisationProperty } from "../customer/model/OrganisationProperty";
import { DynamicFormFieldOption } from "../dynamic-fields/webapp/core";
import { ObjectReferenceWidgetConfiguration } from "../base-components/webapp/core/ObjectReferenceWidgetConfiguration";
import { DefaultColumnConfiguration } from "../../model/configuration/DefaultColumnConfiguration";

export class EditTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const organisationInformation = new ObjectInformationWidgetConfiguration(
            'ticket-edit-dialog-organisation-information', 'Organisation Information',
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
            'ticket-edit-dialog-organisation-widget', 'Organisation Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Organisation', [],
            new ConfigurationDefinition(
                'ticket-edit-dialog-organisation-information', ConfigurationType.ObjectInformation
            ),
            null, false, false, 'kix-icon-man-house', false
        );
        configurations.push(organisationInfoSidebar);

        const contactInformation = new ObjectInformationWidgetConfiguration(
            'ticket-edit-dialog-contact-information', 'Contact Information',
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
            'ticket-edit-dialog-contact-widget', 'Contact Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Contact', [],
            new ConfigurationDefinition('ticket-edit-dialog-contact-information', ConfigurationType.ObjectInformation),
            null, false, false, 'kix-icon-man-bubble', false
        );
        configurations.push(contactInfoSidebar);

        const helpSettings = new HelpWidgetConfiguration(
            'ticket-edit-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Textmodules_TicketEdit', null
        );
        configurations.push(helpSettings);

        const ticketsForAssetsWidget = new WidgetConfiguration(
            'ticket-edit-dialog-object-reference-widget', 'Tickets for Assets', ConfigurationType.Widget,
            'referenced-objects-widget', 'Translatable#Tickets for Assets', [], null,
            new ObjectReferenceWidgetConfiguration(
                'ticket-edit-object-reference-widget-config', 'Tickets for Assets',
                'TicketsForAssetsHandler',
                {
                    properties: [
                        'DynamicFields.AffectedAsset'
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

        const suggestedFAQWidget = new WidgetConfiguration(
            'ticket-edit-dialog-suggested-faq-widget', 'Suggested FAQ', ConfigurationType.Widget,
            'referenced-objects-widget', 'Translatable#Suggested FAQ', [], null,
            new ObjectReferenceWidgetConfiguration(
                'ticket-edit-suggested-faq-config', 'Suggested FAQ',
                'SuggestedFAQHandler',
                {
                    properties: [
                        'Title',
                        'Subject'
                    ],
                    minLength: 3
                },
                [
                    new DefaultColumnConfiguration(
                        null, null, null, 'Title', true, false, true, false, 130, true, false
                    ),
                    new DefaultColumnConfiguration(
                        null, null, null, 'Votes', true, false, false, false, 50, true, false
                    ),
                ]
            ),
            false, false, 'kix-icon-faq'
        );
        configurations.push(suggestedFAQWidget);

        const widget = new WidgetConfiguration(
            'ticket-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-ticket-dialog', 'Translatable#Edit Ticket', [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket New Dialog', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget(
                        'ticket-edit-dialog-organisation-widget', 'ticket-edit-dialog-organisation-widget'
                    ),
                    new ConfiguredWidget('ticket-edit-dialog-contact-widget', 'ticket-edit-dialog-contact-widget'),
                    new ConfiguredWidget(
                        'ticket-edit-dialog-object-reference-widget', 'ticket-edit-dialog-object-reference-widget'
                    ),
                    new ConfiguredWidget(
                        'ticket-edit-dialog-suggested-faq-widget', 'ticket-edit-dialog-suggested-faq-widget'
                    )
                ],
                [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-edit-dialog-widget', 'ticket-edit-dialog-widget',
                        KIXObjectType.TICKET, ContextMode.EDIT
                    )
                ]
            )
        );

        return configurations;
    }


    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'ticket-edit-form';

        configurations.push(
            new FormFieldConfiguration(
                'ticket-edit-form-field-title',
                'Translatable#Title', TicketProperty.TITLE, null, true,
                'Translatable#Helptext_Tickets_TicketEdit_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-edit-form-field-contact',
                'Translatable#Contact', TicketProperty.CONTACT_ID, 'ticket-input-contact', true,
                'Translatable#Helptext_Tickets_TicketEdit_Contact'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-edit-form-field-organisation',
                'Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', true,
                'Translatable#Helptext_Tickets_TicketEdit_Organisation'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-edit-form-field-type',
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
                'ticket-edit-form-field-queue',
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Queue',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),

                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ],
                            null, null,
                            [QueueProperty.SUB_QUEUES],
                            [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-edit-form-field-channel',
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Channel',
                [
                    new FormFieldOption('NO_CHANNEL', true),
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-edit-form-field-owner',
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Owner',
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
                'ticket-edit-form-field-responsible',
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Responsible',
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
                'ticket-edit-form-field-priority',
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketEdit_Priority',
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
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-edit-form-field-state',
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true,
                'Translatable#Helptext_Tickets_TicketEdit_State'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-edit-form-group-data', 'Translatable#Ticket Data',
                [
                    'ticket-edit-form-field-title',
                    'ticket-edit-form-field-contact',
                    'ticket-edit-form-field-organisation',
                    'ticket-edit-form-field-affectedasset',
                    'ticket-edit-form-field-type',
                    'ticket-edit-form-field-queue',
                    'ticket-edit-form-field-channel',
                    'ticket-edit-form-field-owner',
                    'ticket-edit-form-field-responsible',
                    'ticket-edit-form-field-priority',
                    'ticket-edit-form-field-state'
                ], null,
                [
                    new FormFieldConfiguration(
                        'ticket-edit-form-field-planbegin', null, KIXObjectProperty.DYNAMIC_FIELDS, null, false, null,
                        [
                            new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'PlanBegin')
                        ]
                    ),
                    new FormFieldConfiguration(
                        'ticket-edit-form-field-planend', null, KIXObjectProperty.DYNAMIC_FIELDS, null, false, null,
                        [
                            new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'PlanEnd')
                        ]
                    ),
                    new FormFieldConfiguration(
                        'ticket-edit-form-field-affectedasset', null, KIXObjectProperty.DYNAMIC_FIELDS, null,
                        false, 'Translatable#Helptext_Tickets_TicketEdit_AffectedAsset',
                        [
                            new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'AffectedAsset')
                        ]
                    )
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-edit-form-page', 'Translatable#Edit Ticket',
                ['ticket-edit-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Ticket',
                ['ticket-edit-form-page'],
                KIXObjectType.TICKET, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TICKET, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new EditTicketDialogModuleExtension();
};
