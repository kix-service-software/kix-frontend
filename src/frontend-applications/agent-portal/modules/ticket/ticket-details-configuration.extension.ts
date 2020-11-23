/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { LinkedObjectsWidgetConfiguration } from '../../model/configuration/LinkedObjectsWidgetConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { TicketProperty } from './model/TicketProperty';
import { ObjectReferenceWidgetConfiguration } from '../base-components/webapp/core/ObjectReferenceWidgetConfiguration';
import { DefaultColumnConfiguration } from '../../model/configuration/DefaultColumnConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ObjectIcon } from '../icon/model/ObjectIcon';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { UIFilterCriterion } from '../../model/UIFilterCriterion';
import { RoutingConfiguration } from '../../model/configuration/RoutingConfiguration';
import { ContactDetailsContext } from '../customer/webapp/core';
import { ContextMode } from '../../model/ContextMode';
import { ContactProperty } from '../customer/model/ContactProperty';
import { NewConfigItemDialogContext } from '../cmdb/webapp/core';
import { DialogRoutingConfiguration } from '../../model/configuration/DialogRoutingConfiguration';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
import { OrganisationProperty } from '../customer/model/OrganisationProperty';
import { UserProperty } from '../user/model/UserProperty';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { ToggleOptions } from '../base-components/webapp/core/table';

export class Extension extends KIXExtension implements IConfigurationExtension {

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
                KIXObjectProperty.CREATE_BY,
                TicketProperty.CHANGED,
                KIXObjectProperty.CHANGE_BY,
                TicketProperty.AGE,
                TicketProperty.LOCK_ID,
                TicketProperty.TYPE_ID,
                TicketProperty.QUEUE_ID,
                'DynamicFields.AffectedAsset',
                TicketProperty.PRIORITY_ID,
                TicketProperty.RESPONSIBLE_ID,
                TicketProperty.OWNER_ID,
                TicketProperty.STATE_ID,
                TicketProperty.PENDING_TIME
            ], false,
            [
                [TicketProperty.ORGANISATION_ID, organisationRouting],
                [TicketProperty.CONTACT_ID, contactRouting]
            ]
        );
        configurations.push(infoConfig);


        const linkedObjectsConfig = new LinkedObjectsWidgetConfiguration(
            'ticket-details-linked-objects-config', 'Linked Objects Config', ConfigurationType.LinkedObjects, []
        );
        configurations.push(linkedObjectsConfig);

        const linkedObjectsWidget = new WidgetConfiguration(
            'ticket-details-linked-objects-widget', 'linked objects', ConfigurationType.Widget,
            'linked-objects-widget', 'Translatable#Linked Objects', [],
            new ConfigurationDefinition('ticket-details-linked-objects-config', ConfigurationType.LinkedObjects),
            null, false, false, null, false
        );
        configurations.push(linkedObjectsWidget);

        const ticketHistoryWidget = new WidgetConfiguration(
            'ticket-details-history-widget', 'History Widget', ConfigurationType.Widget,
            'ticket-history-widget', 'Translatable#History', [],
            new ConfigurationDefinition('ticket-details-history-config', ConfigurationType.Table),
            null, false, false, null, false
        );
        configurations.push(ticketHistoryWidget);

        const tabSettings = new TabWidgetConfiguration(
            'ticket-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            [
                'ticket-details-info-widget',
                'ticket-details-linked-objects-widget',
                'ticket-details-history-widget'
            ]
        );
        configurations.push(tabSettings);

        const tabWidget = new WidgetConfiguration(
            'ticket-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ticket-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabWidget);

        const contactInfoCard = new WidgetConfiguration(
            'ticket-details-contact-card-widget', 'Contact Info Widget', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#Contact Information', [], null,
            {
                avatar: new ObjectIcon(
                    null, KIXObjectType.CONTACT, '<KIX_CONTACT_ID>', null, null, 'kix-icon-man-bubble'
                ),
                rows: [
                    {
                        margin: false,
                        values: [
                            {
                                icon: null,
                                text: '<KIX_CONTACT_Firstname> <KIX_CONTACT_Lastname>',
                                linkSrc: null
                            },
                        ],
                    },
                    {
                        margin: false,
                        values: [
                            {
                                icon: new ObjectIcon(
                                    null, 'Organisation', '<KIX_ORG_ID>', null, null, 'kix-icon-man-house'
                                ),
                                text: '<KIX_ORG_Name>',
                                linkSrc: null
                            }
                        ],
                    },
                    {
                        margin: true,
                        values: [
                            {
                                icon: 'kix-icon-call',
                                text: '<KIX_CONTACT_Phone>',
                                linkSrc: 'tel:<KIX_CONTACT_Phone>'
                            }
                        ]
                    },
                    {
                        margin: false,
                        values: [
                            {
                                icon: 'kix-icon-mail',
                                text: '<KIX_CONTACT_Email>',
                                linkSrc: null
                            }
                        ]
                    },
                    {
                        margin: true,
                        values: [
                            {
                                icon: 'kix-icon-compass',
                                text: '<KIX_CONTACT_Street>',
                                // tslint:disable-next-line: max-line-length
                                linkSrc: 'https://www.google.de/maps/place/<KIX_CONTACT_Street>,+<KIX_CONTACT_Zip>+<KIX_CONTACT_City>'
                            }
                        ]
                    },
                    {
                        margin: false,
                        values: [
                            {
                                icon: null,
                                text: '<KIX_CONTACT_Zip> <KIX_CONTACT_City>',
                                // tslint:disable-next-line: max-line-length
                                linkSrc: 'https://www.google.de/maps/place/<KIX_CONTACT_Street>,+<KIX_CONTACT_Zip>+<KIX_CONTACT_City>'
                            }
                        ]

                    },
                    {
                        margin: false,
                        values: [
                            {
                                icon: null,
                                text: '<KIX_CONTACT_Country>',
                                // tslint:disable-next-line: max-line-length
                                linkSrc: 'https://www.google.de/maps/place/<KIX_CONTACT_Street>,+<KIX_CONTACT_Zip>+<KIX_CONTACT_City>'
                            }
                        ]
                    }
                ]
            },
            false, false, 'kix-icon-man-house'
        );
        configurations.push(contactInfoCard);

        const ticketsForAssetsWidget = new WidgetConfiguration(
            'ticket-details-object-reference-widget', 'Tickets for Assets', ConfigurationType.Widget,
            'referenced-objects-widget', 'Translatable#Tickets for Assets', [], null,
            new ObjectReferenceWidgetConfiguration(
                'ticket-details-object-reference-widget-config', 'Tickets for Assets',
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
            'ticket-details-dialog-suggested-faq-widget', 'Suggested FAQ', ConfigurationType.Widget,
            'referenced-objects-widget', 'Translatable#Suggested FAQ', [], null,
            new ObjectReferenceWidgetConfiguration(
                'ticket-details-suggested-faq-config', 'Suggested FAQ',
                'SuggestedFAQHandler',
                {
                    properties: [
                        'Title',
                        'Subject'
                    ]
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

        // Overlays
        const organisationObjectInformation = new ObjectInformationWidgetConfiguration(
            'ticket-details-organisation-information-settings', 'Organisation Information Settings',
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
            ], true,
            [
                [OrganisationProperty.NUMBER, organisationRouting],
                [OrganisationProperty.NAME, organisationRouting]
            ]
        );
        configurations.push(organisationObjectInformation);

        const organisationInfoOverlay = new WidgetConfiguration(
            'ticket-details-organisation-overlay', 'Organisation Info Overlay', ConfigurationType.Widget,
            'object-information', 'Translatable#Organisation', [],
            new ConfigurationDefinition(
                'ticket-details-organisation-information-settings', ConfigurationType.ObjectInformation
            )
        );
        configurations.push(organisationInfoOverlay);

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
            KIXObjectType.ARTICLE, undefined, undefined, new TableConfiguration(
                'ticket-details-article-list-table', 'Article Table', ConfigurationType.Table, KIXObjectType.ARTICLE,
                null, null, null, null, null, true, new ToggleOptions(
                    'ticket-article-details', 'article',
                    [
                        'article-reply-action',
                        'article-forward-action',
                        'article-get-plain-action'
                    ], true, null, null, true
                )
            ), ['article-attachment-count']
        );
        configurations.push(tableSettings);

        const articleListWidget = new WidgetConfiguration(
            'ticket-details-article-list-widget', 'Article List Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Article Overview', [],
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
                        'ticket-details-contact-card-widget', 'ticket-details-contact-card-widget'
                    ),
                    new ConfiguredWidget(
                        'ticket-details-object-reference-widget', 'ticket-details-object-reference-widget'
                    ),
                    new ConfiguredWidget(
                        'ticket-details-dialog-suggested-faq-widget', 'ticket-details-dialog-suggested-faq-widget'
                    )
                ],
                [],
                [
                    new ConfiguredWidget('ticket-details-tab-widget', 'ticket-details-tab-widget'),
                ],
                [
                    new ConfiguredWidget(
                        'ticket-details-article-list-widget', 'ticket-details-article-list-widget', null
                    )
                ],
                [
                    'ticket-create-action'
                ],
                [
                    'ticket-edit-action', 'article-new-action', 'linked-objects-edit-action',
                    'ticket-lock-action', 'ticket-watch-action', 'ticket-print-action',
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
                    new ConfiguredWidget('ticket-details-info-widget', 'ticket-details-info-widget'),
                    new ConfiguredWidget(
                        'ticket-details-linked-objects-widget', 'ticket-details-linked-objects-widget', null,
                        [new UIComponentPermission('links', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'ticket-details-history-widget', 'ticket-details-history-widget', null
                    )
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
    return new Extension();
};
