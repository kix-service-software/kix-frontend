/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { DefaultColumnConfiguration } from '../../model/configuration/DefaultColumnConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { RoutingConfiguration } from '../../model/configuration/RoutingConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ContextMode } from '../../model/ContextMode';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { SortOrder } from '../../model/SortOrder';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { ObjectInformationCardConfiguration } from '../base-components/webapp/components/object-information-card-widget/ObjectInformationCardConfiguration';
import { AdditionalTableObjectsHandlerConfiguration } from '../base-components/webapp/core/AdditionalTableObjectsHandlerConfiguration';
import { ConfigItemProperty } from '../cmdb/model/ConfigItemProperty';
import { DynamicFormFieldOption } from '../dynamic-fields/webapp/core';
import { FAQArticleProperty } from '../faq/model/FAQArticleProperty';
import { ObjectIcon } from '../icon/model/ObjectIcon';
import { SearchOperator } from '../search/model/SearchOperator';
import { ArticleProperty } from './model/ArticleProperty';
import { QueueProperty } from './model/QueueProperty';
import { TicketProperty } from './model/TicketProperty';
import { NewTicketDialogContext, TicketSearchContext } from './webapp/core';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const contactInfoCard = new WidgetConfiguration(
            'ticket-new-contact-card-widget', 'Contact Info Widget', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#Contact Information', [], null,
            new ObjectInformationCardConfiguration(
                new ObjectIcon(
                    null, KIXObjectType.CONTACT, '<KIX_CONTACT_ID>', null, null, 'kix-icon-man-bubble'
                ),
                [
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
                                    linkSrc: 'https://www.google.de/maps/place/<KIX_CONTACT_Street>,+<KIX_CONTACT_Zip>+<KIX_CONTACT_City>'
                                },
                                {
                                    icon: null,
                                    text: '<KIX_CONTACT_Zip> <KIX_CONTACT_City>',
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
                                    routingConfiguration: new RoutingConfiguration(
                                        TicketSearchContext.CONTEXT_ID, null,
                                        ContextMode.SEARCH,
                                        null, null, null, null, null,
                                        [
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
                                                    ]
                                                }
                                            ]
                                        ]
                                    )
                                },
                                {
                                    icon: 'kix-icon-ticket',
                                    text: 'Translatable#Open Tickets of Organisation',
                                    routingConfiguration: new RoutingConfiguration(
                                        TicketSearchContext.CONTEXT_ID, null,
                                        ContextMode.SEARCH,
                                        null, null, null, null, null,
                                        [
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
                                                    ]
                                                }
                                            ]
                                        ]
                                    )
                                }
                            ]
                        ]
                    }
                ]
            ),
            false, true, 'kix-icon-man-house'
        );
        configurations.push(contactInfoCard);

        const ticketsForAssetsWidget = new WidgetConfiguration(
            'ticket-new-affected-asset-tickets', 'Tickets for Assets', ConfigurationType.Widget,
            'table-widget', 'Translatable#Tickets for Assets', [], null,
            new TableWidgetConfiguration(
                'ticket-new-ticket-affected-asset-table-widget', 'Asset Tickets',
                ConfigurationType.TableWidget, KIXObjectType.TICKET, null, null,
                new TableConfiguration(
                    'ticket-new-affected-assets-table-config', 'Asset Tickets', ConfigurationType.Table,
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
                            )
                        ], null, 100
                    ), 10,
                    [
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.TICKET_NUMBER, true, false, true, false, 320, true, true
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.TITLE, true, false, true, false, 160, true, true
                        )
                    ], null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ), null, false, false, null
            ),
            false, true, 'kix-icon-ticket', false, false, true, ['DynamicFields.AffectedAsset']
        );
        configurations.push(ticketsForAssetsWidget);

        const ticketsForContactWidget = new WidgetConfiguration(
            'ticket-new-contact-tickets', 'Tickets for Contact', ConfigurationType.Widget,
            'table-widget', 'Translatable#Tickets for Contact', [], null,
            new TableWidgetConfiguration(
                'ticket-new-contact-ticket-widget', 'Contact Tickets',
                ConfigurationType.TableWidget, KIXObjectType.TICKET, null, null,
                new TableConfiguration(
                    'ticket-new-contact-tickets-table-config', 'Contact Tickets', ConfigurationType.Table,
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
                            null, null, null, TicketProperty.TITLE, true, false, true, false, 250, true, true
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.STATE_ID, true, true, true, false, 70,
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, TicketProperty.TYPE_ID, true, false, true, false, 50, true, true, true
                        ),
                    ], null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ), null, false, false, null
            ),
            false, true, 'kix-icon-ticket', false, false, true, [TicketProperty.CONTACT_ID]
        );
        configurations.push(ticketsForContactWidget);

        const suggestedFAQWidget = new WidgetConfiguration(
            'ticket-new-dialog-suggested-faq-widget', 'Suggested FAQ', ConfigurationType.Widget,
            'table-widget', 'Translatable#Suggested FAQ', [], null,
            new TableWidgetConfiguration(
                'ticket-new-suggested-faq-table-widget', 'Suggested FAQ',
                ConfigurationType.TableWidget, KIXObjectType.FAQ_ARTICLE, null, null,
                new TableConfiguration(
                    'ticket-new-suggested-faq-table-config', 'Suggested FAQ', ConfigurationType.Table,
                    KIXObjectType.FAQ_ARTICLE,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                'DynamicFields.RelatedAssets', SearchOperator.IN,
                                FilterDataType.NUMERIC, FilterType.AND, '<KIX_TICKET_DynamicField_AffectedAsset_ObjectValue>'
                            ),
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, 1
                            )
                        ], null, 100, [FAQArticleProperty.VOTES]
                    ), 10,
                    [
                        new DefaultColumnConfiguration(
                            null, null, null, '', false, false, false, false, 30,
                            false, false, false, null, false, 'faq-article-import-cell'
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, '', false, false, false, false, 30,
                            false, false, false, null, false, 'faq-article-html-preview-cell'
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, FAQArticleProperty.TITLE, true, false, true, false, 260, true, false
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, FAQArticleProperty.VOTES, true, false, false, false, 50, true, false
                        ),
                    ], null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL,
                    null, null, null,
                    [
                        new AdditionalTableObjectsHandlerConfiguration(
                            'ticket-new-suggested-faq-handler-config', 'FAQs by ticket title or subject',
                            'SuggestedFAQHandler',
                            {
                                minLength: 3,
                                onlyValid: true
                            },
                            [
                                TicketProperty.TITLE,
                                ArticleProperty.SUBJECT
                            ]
                        )
                    ], false
                ), null, false, false, null
            ),
            false, true, 'kix-icon-faq', false, false, true, ['DynamicFields.AffectedAsset']
        );
        configurations.push(suggestedFAQWidget);

        const assignedAssets = new WidgetConfiguration(
            'ticket-new-assigned-assets', 'Assigned Assets', ConfigurationType.Widget,
            'table-widget', 'Translatable#Assigned Assets', [], null,
            new TableWidgetConfiguration(
                'ticket-new-assigned-assets-table-widget', 'Assigned Assets',
                ConfigurationType.TableWidget, KIXObjectType.CONFIG_ITEM, [ConfigItemProperty.NUMBER, SortOrder.UP],
                null,
                null, null, false, false, null, undefined,
                undefined,
                new TableConfiguration(
                    'ticket-new-assigned-assets-table-config', 'Assigned Assets', ConfigurationType.Table,
                    KIXObjectType.CONFIG_ITEM,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                ConfigItemProperty.ASSIGNED_CONTACT, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, '<KIX_TICKET_ContactID>'
                            )
                        ], null, 100
                    ), 10,
                    [
                        new DefaultColumnConfiguration(
                            null, null, null, '', false, false, false, false, 30,
                            false, false, false, null, false, 'add-to-affected-assets-cell',
                            'Translatable#Contained in Affected Assets'
                        ),
                        new DefaultColumnConfiguration(
                            null, null, null, ConfigItemProperty.NUMBER, true, false, true, false, 120, true, true),
                        new DefaultColumnConfiguration(
                            null, null, null, ConfigItemProperty.NAME, true, false, true, false, 120, true, true),
                        new DefaultColumnConfiguration(null, null, null,
                            ConfigItemProperty.CLASS_ID, true, false, true, false, 120, true, true, true
                        ),
                    ], null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                )
            ),
            false, true, 'kix-icon-cmdb', false, false, true, [TicketProperty.CONTACT_ID]
        );
        configurations.push(assignedAssets);

        const dialogWidget = new WidgetConfiguration(
            'ticket-new-dialog-widget', 'New Ticket Dialog', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Ticket', [], null, null,
            false, false, 'kix-icon-new-ticket'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket New Dialog', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('ticket-new-contact-card-widget', 'ticket-new-contact-card-widget'),
                    new ConfiguredWidget('ticket-new-assigned-assets', 'ticket-new-assigned-assets', undefined,
                        [
                            new UIComponentPermission('/cmdb/configitems', [CRUD.READ]),
                            new UIComponentPermission('/tickets', [CRUD.READ])
                        ]),
                    new ConfiguredWidget(
                        'ticket-new-affected-asset-tickets', 'ticket-new-affected-asset-tickets'
                    ),
                    new ConfiguredWidget('ticket-new-contact-tickets', 'ticket-new-contact-tickets'),
                    new ConfiguredWidget(
                        'ticket-new-dialog-suggested-faq-widget', 'ticket-new-dialog-suggested-faq-widget'
                    )
                ],
                [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-new-dialog-widget', 'ticket-new-dialog-widget', KIXObjectType.TICKET, ContextMode.CREATE
                    )
                ], [], [], [], []
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
                    new FormFieldOption('SHOW_NEW_CONTACT', true),
                    new FormFieldOption(FormFieldOptions.SHOW_INVALID, false)
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
                'ticket-new-form-field-channel',
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Channel'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'ticket-new-form-field-owner',
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketCreate_Owner',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ], undefined, undefined, undefined, undefined,
                            [
                                ['requiredPermission', 'TicketRead,TicketCreate']
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
                'Translatable#State', TicketProperty.STATE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_State',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE),
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
                ],
                new FormFieldValue(2)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-new-form-group-data', 'Translatable#Ticket Data',
                [
                    'ticket-new-form-field-contact',
                    'ticket-new-form-field-organisation',
                    'ticket-new-form-field-affectedasset',
                    'ticket-new-form-field-type',
                    'ticket-new-form-field-queue',
                    'ticket-new-form-field-channel',
                    'ticket-new-form-field-owner',
                    'ticket-new-form-field-priority',
                    'ticket-new-form-field-state',
                ], null,
                [
                    new FormFieldConfiguration(
                        'ticket-new-form-field-affectedasset', null, KIXObjectProperty.DYNAMIC_FIELDS, null,
                        false, 'Translatable#Helptext_Tickets_TicketCreate_AffectedAsset',
                        [
                            new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'AffectedAsset')
                        ]
                    )
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

module.exports = (data, host, options): Extension => {
    return new Extension();
};
