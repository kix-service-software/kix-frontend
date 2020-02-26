/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { TabWidgetConfiguration } from "../../model/configuration/TabWidgetConfiguration";
import { ConfigurationDefinition } from "../../model/configuration/ConfigurationDefinition";
import { LinkedObjectsWidgetConfiguration } from "../../model/configuration/LinkedObjectsWidgetConfiguration";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { RoutingConfiguration } from "../../model/configuration/RoutingConfiguration";
import { ContextMode } from "../../model/ContextMode";
import { ObjectInformationWidgetConfiguration } from "../../model/configuration/ObjectInformationWidgetConfiguration";
import { TableWidgetConfiguration } from "../../model/configuration/TableWidgetConfiguration";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ConfiguredWidget } from "../../model/configuration/ConfiguredWidget";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { CRUD } from "../../../../server/model/rest/CRUD";
import { TicketProperty } from "./model/TicketProperty";
import { ContactProperty } from "../customer/model/ContactProperty";
import { UserProperty } from "../user/model/UserProperty";
import { OrganisationProperty } from "../customer/model/OrganisationProperty";
import { ObjectReferenceWidgetConfiguration } from "../base-components/webapp/core/ObjectReferenceWidgetConfiguration";
import { DefaultColumnConfiguration } from "../../model/configuration/DefaultColumnConfiguration";

export class TicketDetailsModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-details';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const ticketInfoLane = new WidgetConfiguration(
            'ticket-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'ticket-info-widget', 'Translatable#Ticket Information', [],
            new ConfigurationDefinition(
                'ticket-details-object-information-config', ConfigurationType.ObjectInformation
            ), null, false, true, null, false
        );
        configurations.push(ticketInfoLane);

        const organisationRouting = new RoutingConfiguration(
            'organisation-details', KIXObjectType.ORGANISATION,
            ContextMode.DETAILS, 'ID', false
        );

        const contactRouting = new RoutingConfiguration(
            'contact-details', KIXObjectType.CONTACT,
            ContextMode.DETAILS, 'ID', false
        );

        const infoConfig = new ObjectInformationWidgetConfiguration(
            'ticket-details-object-information-config', 'Ticket Info', ConfigurationType.ObjectInformation,
            KIXObjectType.TICKET,
            [
                TicketProperty.ORGANISATION_ID,
                TicketProperty.CONTACT_ID,
                TicketProperty.CREATED,
                TicketProperty.AGE,
                TicketProperty.LOCK_ID,
                TicketProperty.TYPE_ID,
                TicketProperty.QUEUE_ID,
                TicketProperty.PRIORITY_ID,
                TicketProperty.RESPONSIBLE_ID,
                TicketProperty.OWNER_ID,
                TicketProperty.TIME_UNITS,
                TicketProperty.STATE_ID,
                TicketProperty.PENDING_TIME
            ], false,
            [
                [TicketProperty.ORGANISATION_ID, organisationRouting],
                [TicketProperty.CONTACT_ID, contactRouting]
            ]
        );
        configurations.push(infoConfig);

        const tabSettings = new TabWidgetConfiguration(
            'ticket-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['ticket-details-info-widget']
        );
        configurations.push(tabSettings);

        const tabWidget = new WidgetConfiguration(
            'ticket-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ticket-details-tab-widget-config', ConfigurationType.TabWidget),
            false, true
        );
        configurations.push(tabWidget);

        const ticketHistoryLane = new WidgetConfiguration(
            'ticket-details-history-widget', 'History Widget', ConfigurationType.Widget,
            'ticket-history-widget', 'Translatable#History', [], null, null, true, true, null, false
        );
        configurations.push(ticketHistoryLane);

        const linkedObjectsConfig = new LinkedObjectsWidgetConfiguration(
            'ticket-details-linked-objects-config', 'Linked Objects Config', ConfigurationType.LinkedObjects,
            [
                ['Tickets', KIXObjectType.TICKET],
                ['Config Items', KIXObjectType.CONFIG_ITEM],
                ['FAQs', KIXObjectType.FAQ_ARTICLE]
            ]
        );
        configurations.push(linkedObjectsConfig);

        const linkedObjectsWidget = new WidgetConfiguration(
            'ticket-details-linked-objects-widget', 'linked objects', ConfigurationType.Widget,
            'linked-objects-widget', 'Translatable#Linked Objects', ['linked-objects-edit-action'],
            new ConfigurationDefinition('ticket-details-linked-objects-config', ConfigurationType.LinkedObjects),
            null, true, true, null, false
        );
        configurations.push(linkedObjectsWidget);

        // Sidebars
        const organisationObjectInformation = new ObjectInformationWidgetConfiguration(
            'ticket-details-organisation-information-settings', 'Organisation Information Settings',
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
            ], true,
            [
                [OrganisationProperty.NUMBER, organisationRouting],
                [OrganisationProperty.NAME, organisationRouting]
            ]
        );
        configurations.push(organisationObjectInformation);

        const organisationInfoSidebar = new WidgetConfiguration(
            'ticket-details-organisation-info-widget', 'Organisation Info Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Organisation', [],
            new ConfigurationDefinition(
                'ticket-details-organisation-information-settings', ConfigurationType.ObjectInformation
            ),
            null, false, false, 'kix-icon-man-house', false
        );
        configurations.push(organisationInfoSidebar);

        const contactObjectInformation = new ObjectInformationWidgetConfiguration(
            'ticket-details-contact-information-settings', 'Contact Information Settings',
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
                ContactProperty.FAX,
                ContactProperty.EMAIL
            ], true,
            [
                [ContactProperty.LASTNAME, contactRouting],
                [ContactProperty.FIRSTNAME, contactRouting],
                [UserProperty.USER_LOGIN, contactRouting]
            ]
        );
        configurations.push(contactObjectInformation);

        const contactInfoSidebar = new WidgetConfiguration(
            'ticket-details-contact-info-widget', 'Contact Info Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Contact', [],
            new ConfigurationDefinition(
                'ticket-details-contact-information-settings', ConfigurationType.ObjectInformation
            ),
            null, false, false, 'kix-icon-man-bubble', false
        );
        configurations.push(contactInfoSidebar);

        const ticketsForAssetsWidget = new WidgetConfiguration(
            'ticket-details-object-reference-widget', 'Tickets for Assets', ConfigurationType.Widget,
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


        // Overlays
        const organisationInfoOverlay = new WidgetConfiguration(
            'ticket-details-organisation-overlay', 'Organisation Info Overlay', ConfigurationType.Widget,
            'object-information', 'Translatable#Organisation', [],
            new ConfigurationDefinition(
                'ticket-details-organisation-information-settings', ConfigurationType.ObjectInformation
            )
        );
        configurations.push(organisationInfoOverlay);

        const contactInfoOverlay = new WidgetConfiguration(
            'ticket-details-contact-overlay', 'Contact Info Overlay', ConfigurationType.Widget,
            'object-information', 'Translatable#Contact', [],
            new ConfigurationDefinition(
                'ticket-details-contact-information-settings', ConfigurationType.ObjectInformation
            ),
            null, false, false, 'kix-icon-man-bubble', false
        );
        configurations.push(contactInfoOverlay);


        const toReceiverOverlay = new WidgetConfiguration(
            'ticket-details-to-receiver-overlay', 'To Receiver Overlay', ConfigurationType.Widget,
            'article-receiver-list', 'Translatable#Recipient: To', [], null, null,
            false, false, 'kix-icon-man-mail-To', false
        );
        configurations.push(toReceiverOverlay);

        const ccReceiverOverlay = new WidgetConfiguration(
            'ticket-details-cc-receiver-overlay', 'Cc Receiver Overlay', ConfigurationType.Widget,
            'article-receiver-list', 'Translatable#Recipient: Cc', [], null, null,
            false, false, 'kix-icon-man-mail-Cc', false
        );
        configurations.push(ccReceiverOverlay);

        const bccReceiverOverlay = new WidgetConfiguration(
            'ticket-details-bcc-receiver-overlay', 'Bcc Receiver Overlay', ConfigurationType.Widget,
            'article-receiver-list', 'Translatable#Recipient: Bcc', [], null, null,
            false, false, 'kix-icon-man-mail-Bcc', false
        );
        configurations.push(bccReceiverOverlay);

        const articleAttachmentOverlay = new WidgetConfiguration(
            'ticket-details-article-attachments-overlay', 'Article Attachments Overlay', ConfigurationType.Widget,
            'article-attachment-widget', 'Translatable#Attachments', ['article-attachment-zip-download'], null, null,
            false, false, 'kix-icon-attachement', false
        );
        configurations.push(articleAttachmentOverlay);


        const tableSettings = new TableWidgetConfiguration(
            'ticket-details-article-list-table-config', 'Article Table', ConfigurationType.TableWidget,
            KIXObjectType.ARTICLE, undefined, undefined, null, ['article-attachment-count']
        );
        configurations.push(tableSettings);

        const articleListWidget = new WidgetConfiguration(
            'ticket-details-article-list-widget', 'Article List Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Article Overview', ['article-new-action'],
            new ConfigurationDefinition('ticket-details-article-list-table-config', ConfigurationType.TableWidget),
            null, false, true, null, true
        );
        configurations.push(articleListWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Details', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget(
                        'ticket-details-organisation-info-widget', 'ticket-details-organisation-info-widget', null,
                        [new UIComponentPermission('organisations', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'ticket-details-contact-info-widget', 'ticket-details-contact-info-widget', null,
                        [new UIComponentPermission('contacts', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'ticket-details-object-reference-widget', 'ticket-details-object-reference-widget'
                    )
                ],
                [],
                [
                    new ConfiguredWidget('ticket-details-tab-widget', 'ticket-details-tab-widget'),
                    new ConfiguredWidget(
                        'ticket-details-linked-objects-widget', 'ticket-details-linked-objects-widget', null,
                        [new UIComponentPermission('links', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'ticket-details-history-widget', 'ticket-details-history-widget', null,
                        [new UIComponentPermission('tickets/*/history', [CRUD.READ])]
                    )
                ],
                [
                    new ConfiguredWidget(
                        'ticket-details-article-list-widget', 'ticket-details-article-list-widget', null,
                        [new UIComponentPermission('tickets/*/articles', [CRUD.READ])]
                    )
                ],
                [
                    'ticket-create-action'
                ],
                [
                    'ticket-edit-action', 'article-new-action', 'linked-objects-edit-action',
                    'ticket-lock-action', 'ticket-watch-action', 'print-action',
                ],
                [
                    new ConfiguredWidget(
                        'organisation-info-overlay', 'ticket-details-organisation-overlay', null,
                        [new UIComponentPermission('organisations', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'contact-info-overlay', 'ticket-details-contact-overlay', null,
                        [new UIComponentPermission('contacts', [CRUD.READ])]
                    ),
                    new ConfiguredWidget('to-receiver-overlay', 'ticket-details-to-receiver-overlay'),
                    new ConfiguredWidget('cc-receiver-overlay', 'ticket-details-cc-receiver-overlay'),
                    new ConfiguredWidget('bcc-receiver-overlay', 'ticket-details-bcc-receiver-overlay'),
                    new ConfiguredWidget('article-attachment-widget', 'ticket-details-article-attachments-overlay')
                ],
                [
                    new ConfiguredWidget('ticket-details-info-widget', 'ticket-details-info-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new TicketDetailsModuleFactoryExtension();
};
