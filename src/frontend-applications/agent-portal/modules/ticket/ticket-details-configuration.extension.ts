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
import { SearchOperator } from '../search/model/SearchOperator';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { ToggleOptions } from '../base-components/webapp/core/table';
import { FilterCriteria } from '../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { ContextMode } from '../../model/ContextMode';
import { FilterType } from '../../model/FilterType';
import { FilterDataType } from '../../model/FilterDataType';
import { CacheState } from '../search/model/CacheState';
import { Ticket } from './model/Ticket';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-details';
    }

    // tslint:disable: max-line-length
    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const ticketInfoCard = new WidgetConfiguration(
            'ticket-details-info-card', 'Ticket Info Widget', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#Ticket Information', [], null,
            {
                avatar: [],
                rows: [
                    {
                        title: 'Translatable#Summary',
                        style: '',
                        separator: true,
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.ORGANISATION_ID
                                    },
                                    routingConfiguration: {
                                        contextId: 'organisation-details',
                                        objectType: KIXObjectType.ORGANISATION,
                                        contextMode: ContextMode.DETAILS,
                                        objectIdProperty: 'ID',
                                        history: false,
                                        resetContext: true,
                                        contextType: 'MAIN'
                                    },
                                    routingObjectId: '<KIX_TICKET_OrganisationID>'
                                },
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.TYPE_ID
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.CONTACT_ID
                                    },
                                    routingConfiguration: {
                                        contextId: 'contact-details',
                                        objectType: KIXObjectType.CONTACT,
                                        contextMode: ContextMode.DETAILS,
                                        objectIdProperty: 'ID',
                                        history: false,
                                        resetContext: true,
                                        contextType: 'MAIN'
                                    },
                                    routingObjectId: '<KIX_TICKET_ContactID>'
                                },
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.PRIORITY_ID
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.STATE_ID
                                    }
                                },
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: 'DynamicFields.CloseCode'
                                    },
                                    conditions: [
                                        {
                                            property: 'DynamicFields.CloseCode',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: null
                                        }
                                    ]
                                },
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: 'DynamicFields.AnonymiseTicket'
                                    },
                                    conditions: [
                                        {
                                            property: 'DynamicFields.AnonymiseTicket',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        ],
                    },
                    {
                        title: 'Translatable#Assignees',
                        style: '',
                        separator: true,
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.RESPONSIBLE_ID
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.OWNER_ID
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: TicketProperty.QUEUE_ID
                                    },
                                    conditions: [
                                        {
                                            property: TicketProperty.OWNER_ID,
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: 1
                                        }
                                    ]
                                }
                            ]
                        ],
                    },
                    {
                        title: 'Translatable#Checklists',
                        style: '',
                        separator: true,
                        values: [
                            [
                                {
                                    text: 'Mobile Processing Checklist 010',
                                    textStyle: 'font-weight:bold;margin-bottom:0.5rem',
                                    icon: 'kix-icon-ci',
                                    componentId: 'dynamic-field-value',
                                    componentData: {
                                        name: 'MobileProcessingChecklist010'
                                    },
                                    conditions: [
                                        {
                                            property: 'DynamicFields.MobileProcessingChecklist010',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: null
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: 'Mobile Processing Checklist 020',
                                    textStyle: 'font-weight:bold;margin-bottom:0.5rem',
                                    icon: 'kix-icon-ci',
                                    componentId: 'dynamic-field-value',
                                    componentData: {
                                        name: 'MobileProcessingChecklist020'
                                    },
                                    conditions: [
                                        {
                                            property: 'DynamicFields.MobileProcessingChecklist020',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        ]
                    },
                    {
                        title: 'Translatable#References',
                        style: '',
                        separator: false,
                        values: [
                            [
                                {
                                    text: 'Translatable#Affected Assets',
                                    textStyle: 'font-weight:bold;margin-bottom:0.5rem',
                                    icon: 'kix-icon-ci',
                                    componentId: 'dynamic-field-value',
                                    componentData: {
                                        name: 'AffectedAsset'
                                    },
                                    conditions: [
                                        {
                                            property: 'DynamicFields.AffectedAsset',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        ]
                    }, {
                        title: ' ',
                        separator: true,
                        values: [
                            [
                                {
                                    text: 'Translatable#Related Tickets',
                                    textStyle: 'font-weight:bold;margin-bottom:0.5rem',
                                    icon: 'kix-icon-ci',
                                    componentId: 'dynamic-field-value',
                                    componentData: {
                                        name: 'RelatedTickets'
                                    },
                                    conditions: [
                                        {
                                            property: 'DynamicFields.RelatedTickets',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        ]
                    }, {
                        title: 'Translatable#Scheduling',
                        separator: false,
                        values: [
                            [
                                {
                                    text: 'Translatable#Accounted Time: {0}',
                                    textPlaceholder: [
                                        '<KIX_TICKET_AccountedTime>'
                                    ],
                                    icon: 'kix-icon-time',
                                    conditions: [
                                        {
                                            property: 'AccountedTime',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: 0
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: 'Pending until: {0} ({1})',
                                    textPlaceholder: [
                                        '<KIX_TICKET_PendingTime>',
                                        '<KIX_TICKET_UntilTime>'
                                    ],
                                    icon: 'kix-icon-time-wait',
                                    conditions: [
                                        {
                                            property: TicketProperty.STATE_TYPE,
                                            operator: SearchOperator.CONTAINS,
                                            value: 'pending'
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: 'Translatable#Plan: {0} - {1}',
                                    textPlaceholder: [
                                        '<KIX_TICKET_DynamicField_PlanBegin>',
                                        '<KIX_TICKET_DynamicField_PlanEnd>'
                                    ],
                                    icon: 'kix-icon-time-back',
                                    conditions: [
                                        {
                                            property: 'DynamicFields.PlanBegin',
                                            operator: SearchOperator.NOT_EQUALS,
                                            value: null
                                        }
                                    ]
                                }

                            ],
                        ]
                    },
                    {
                        title: '',
                        style: '',
                        separator: false,
                        values: [
                            [
                                {
                                    icon: null,
                                    iconStyle: '',
                                    text: 'Translatable#Created by {0} at {1}. Last change by {2} at {3}',
                                    textPlaceholder: [
                                        '<KIX_TICKET_CreateBy>',
                                        '<KIX_TICKET_Created>',
                                        '<KIX_TICKET_ChangeBy>',
                                        '<KIX_TICKET_Changed>'
                                    ],
                                    textStyle: 'color:#5b5b5b;font-style:italic',
                                    linkSrc: null
                                }
                            ]
                        ]
                    }
                ]
            },
            false, false, 'kix-icon-ticket'
        );
        configurations.push(ticketInfoCard);

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
                'ticket-details-info-card',
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
                        separator: false,
                        values: [
                            [
                                {
                                    icon: null,
                                    text: '<KIX_CONTACT_Firstname> <KIX_CONTACT_Lastname>',
                                    linkSrc: null
                                },
                                {
                                    icon: new ObjectIcon(
                                        null, 'Organisation', '<KIX_ORG_ID>', null, null, 'kix-icon-man-house'
                                    ),
                                    text: '<KIX_ORG_Name>',
                                    linkSrc: null
                                }
                            ]
                        ],
                    },
                    {
                        values: [
                            [
                                {
                                    icon: 'kix-icon-call',
                                    text: '<KIX_CONTACT_Phone>',
                                    linkSrc: 'tel:<KIX_CONTACT_Phone>'
                                },
                                {
                                    icon: 'kix-icon-mail',
                                    text: '<KIX_CONTACT_Email>',
                                    linkSrc: null
                                }
                            ]
                        ]
                    },
                    {
                        values: [
                            [
                                {
                                    icon: 'kix-icon-compass',
                                    text: '<KIX_CONTACT_Street>',
                                    // tslint:disable-next-line: max-line-length
                                    linkSrc: 'https://www.google.de/maps/place/<KIX_CONTACT_Street>,+<KIX_CONTACT_Zip>+<KIX_CONTACT_City>'
                                },
                                {
                                    icon: null,
                                    text: '<KIX_CONTACT_Zip> <KIX_CONTACT_City>',
                                    // tslint:disable-next-line: max-line-length
                                    linkSrc: 'https://www.google.de/maps/place/<KIX_CONTACT_Street>,+<KIX_CONTACT_Zip>+<KIX_CONTACT_City>'
                                },
                                {
                                    icon: null,
                                    text: '<KIX_CONTACT_Country>',
                                    linkSrc: 'https://www.google.de/maps/place/<KIX_CONTACT_Street>,+<KIX_CONTACT_Zip>+<KIX_CONTACT_City>'
                                }
                            ]
                        ]
                    },
                    {
                        values: [
                            [
                                {
                                    icon: 'kix-icon-ticket',
                                    text: 'Translatable#Open Tickets of Contact',
                                    routingConfiguration: {
                                        contextId: 'search',
                                        contextMode: ContextMode.SEARCH,
                                        externalLink: false,
                                        params: [
                                            [
                                                'search',
                                                {
                                                    objectType: KIXObjectType.TICKET,
                                                    criteria: [
                                                        {
                                                            property: TicketProperty.CONTACT_ID,
                                                            operator: SearchOperator.EQUALS,
                                                            type: 'STRING',
                                                            filterType: FilterType.AND,
                                                            value: '<KIX_TICKET_ContactID>'
                                                        },
                                                        {
                                                            property: TicketProperty.STATE_ID,
                                                            operator: SearchOperator.EQUALS,
                                                            type: FilterDataType.NUMERIC,
                                                            filterType: FilterType.AND,
                                                            value: 2
                                                        }
                                                    ],
                                                    status: CacheState.VALID
                                                }
                                            ]
                                        ]
                                    }
                                },
                                {
                                    icon: 'kix-icon-ticket',
                                    text: 'Translatable#Open Tickets of Organisation',
                                    routingConfiguration: {
                                        contextId: 'search',
                                        contextMode: ContextMode.SEARCH,
                                        externalLink: false,
                                        params: [
                                            [
                                                'search',
                                                {
                                                    objectType: KIXObjectType.TICKET,
                                                    criteria: [
                                                        {
                                                            property: TicketProperty.ORGANISATION_ID,
                                                            operator: SearchOperator.EQUALS,
                                                            type: 'STRING',
                                                            filterType: FilterType.AND,
                                                            value: '<KIX_TICKET_OrganisationID>'
                                                        },
                                                        {
                                                            property: TicketProperty.STATE_ID,
                                                            operator: SearchOperator.EQUALS,
                                                            type: FilterDataType.NUMERIC,
                                                            filterType: FilterType.AND,
                                                            value: 2
                                                        }
                                                    ],
                                                    status: CacheState.VALID
                                                }
                                            ]
                                        ]
                                    }
                                }
                            ]
                        ]
                    }
                ]
            },
            false, false, 'kix-icon-man-house'
        );
        configurations.push(contactInfoCard);

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
                        null, null, null, 'Title', true, false, true, false, 180, true, true
                    ),
                    new DefaultColumnConfiguration(
                        null, null, null, 'Votes', true, false, false, false, 50, true, false
                    ),
                ]
            ),
            false, false, 'kix-icon-faq'
        );
        configurations.push(suggestedFAQWidget);

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

        const ticketsForAssetsWidget = new WidgetConfiguration(
            'ticket-details-affected-asset-tickets', 'Tickets for Assets', ConfigurationType.Widget,
            'table-widget', 'Translatable#Tickets for Assets', [], null,
            new TableWidgetConfiguration(
                'ticket-details-ticket-affected-asset-table-widget', 'Asset Tickets',
                ConfigurationType.TableWidget, KIXObjectType.TICKET, null, null,
                new TableConfiguration(
                    'ticket-details-affected-assets-table-config', 'Asset Tickets', ConfigurationType.Table,
                    KIXObjectType.TICKET,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                TicketProperty.STATE_TYPE, SearchOperator.EQUALS,
                                FilterDataType.STRING, FilterType.AND, 'Open'
                            ),
                            new FilterCriteria(
                                'DynamicFields.AffectedAsset', SearchOperator.IN,
                                FilterDataType.NUMERIC, FilterType.AND, '<KIX_TICKET_DynamicField_AffectedAsset_ObjectValue>'
                            ),
                            new FilterCriteria(
                                TicketProperty.TICKET_ID, SearchOperator.NOT_EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, '<KIX_TICKET_TicketID>'
                            )
                        ], null, 100
                    ), 10,
                    [
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.TITLE, true, false, true, false, 320, true, true
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.TYPE_ID, false, true, true, false, 50, true, true, true
                        )
                    ], null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ), null, false, false, null
            ),
            false, true, 'kix-icon-ticket', false, true
        );
        configurations.push(ticketsForAssetsWidget);

        const ticketsForContactWidget = new WidgetConfiguration(
            'ticket-details-contact-tickets', 'Tickets for Contact', ConfigurationType.Widget,
            'table-widget', 'Translatable#Tickets for Contact', [], null,
            new TableWidgetConfiguration(
                'ticket-details-contact-ticket-widget', 'Contact Tickets',
                ConfigurationType.TableWidget, KIXObjectType.TICKET, null, null,
                new TableConfiguration(
                    'ticket-details-contact-tickets-table-config', 'Contact Tickets', ConfigurationType.Table,
                    KIXObjectType.TICKET,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                TicketProperty.STATE_TYPE, SearchOperator.EQUALS,
                                FilterDataType.STRING, FilterType.AND, 'Open'
                            ),
                            new FilterCriteria(
                                TicketProperty.CONTACT_ID, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, '<KIX_TICKET_ContactID>'
                            ),
                            new FilterCriteria(
                                TicketProperty.TICKET_ID, SearchOperator.NOT_EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, '<KIX_TICKET_TicketID>'
                            )
                        ], null, 100
                    ), 10,
                    [
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.TITLE, true, false, true, false, 320, true, true
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.TYPE_ID, false, true, true, false, 50, true, true, true
                        )
                    ], null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ), null, false, false, null
            ),
            false, true, 'kix-icon-ticket', false, true
        );
        configurations.push(ticketsForContactWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Details', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget(
                        'ticket-details-contact-card-widget', 'ticket-details-contact-card-widget'
                    ),
                    new ConfiguredWidget(
                        'ticket-details-dialog-suggested-faq-widget', 'ticket-details-dialog-suggested-faq-widget'
                    ),
                    new ConfiguredWidget(
                        'ticket-details-affected-asset-tickets', 'ticket-details-affected-asset-tickets'
                    ),
                    new ConfiguredWidget('ticket-details-contact-tickets', 'ticket-details-contact-tickets')
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
                    new ConfiguredWidget('ticket-details-info-card', 'ticket-details-info-card'),
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
