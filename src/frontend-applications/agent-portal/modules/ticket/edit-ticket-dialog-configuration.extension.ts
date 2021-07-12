/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditTicketDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { HelpWidgetConfiguration } from '../../model/configuration/HelpWidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { TicketProperty } from './model/TicketProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { QueueProperty } from './model/QueueProperty';
import { ArticleProperty } from './model/ArticleProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { DynamicFormFieldOption } from '../dynamic-fields/webapp/core';
import { AdditionalTableObjectsHandlerConfiguration } from '../base-components/webapp/core/AdditionalTableObjectsHandlerConfiguration';
import { DefaultColumnConfiguration } from '../../model/configuration/DefaultColumnConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ObjectIcon } from '../icon/model/ObjectIcon';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { FAQArticleProperty } from '../faq/model/FAQArticleProperty';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const contactInfoCard = new WidgetConfiguration(
            'ticket-edit-contact-card-widget', 'Contact Info Widget', ConfigurationType.Widget,
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
                                    // tslint:disable-next-line: max-line-length
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
                                                    ]
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
                                                    ]
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
            false, true, 'kix-icon-man-house'
        );
        configurations.push(contactInfoCard);

        const helpSettings = new HelpWidgetConfiguration(
            'ticket-edit-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Textmodules_TicketEdit', null
        );
        configurations.push(helpSettings);

        const ticketsForAssetsWidget = new WidgetConfiguration(
            'ticket-edit-affected-asset-tickets', 'Tickets for Assets', ConfigurationType.Widget,
            'table-widget', 'Translatable#Tickets for Assets', [], null,
            new TableWidgetConfiguration(
                'ticket-edit-ticket-affected-asset-table-widget', 'Asset Tickets',
                ConfigurationType.TableWidget, KIXObjectType.TICKET, null, null,
                new TableConfiguration(
                    'ticket-edit-affected-assets-table-config', 'Asset Tickets', ConfigurationType.Table,
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
            false, true, 'kix-icon-ticket', false, false, true, ['DynamicFields.AffectedAsset']
        );
        configurations.push(ticketsForAssetsWidget);

        const suggestedFAQWidget = new WidgetConfiguration(
            'ticket-edit-dialog-suggested-faq-widget', 'Suggested FAQ', ConfigurationType.Widget,
            'table-widget', 'Translatable#Suggested FAQ', [], null,
            new TableWidgetConfiguration(
                'ticket-edit-suggested-faq-table-widget', 'Suggested FAQ',
                ConfigurationType.TableWidget, KIXObjectType.FAQ_ARTICLE, null, null,
                new TableConfiguration(
                    'ticket-edit-suggested-faq-table-config', 'Suggested FAQ', ConfigurationType.Table,
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
                            'ticket-edit-suggested-faq-handler-config', 'FAQs by ticket title or subject',
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
                    ],
                ), null, false, false, null
            ),
            false, true, 'kix-icon-faq', false, false, true, ['DynamicFields.AffectedAsset']
        );
        configurations.push(suggestedFAQWidget);

        const widget = new WidgetConfiguration(
            'ticket-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Ticket', [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Edit Dialog', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('ticket-edit-contact-card-widget', 'ticket-edit-contact-card-widget'),
                    new ConfiguredWidget(
                        'ticket-edit-affected-asset-tickets', 'ticket-edit-affected-asset-tickets'
                    ),
                    new ConfiguredWidget(
                        'ticket-edit-dialog-suggested-faq-widget', 'ticket-edit-dialog-suggested-faq-widget'
                    )
                ],
                [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-edit-dialog-widget', 'ticket-edit-dialog-widget',
                        KIXObjectType.TICKET, ContextMode.EDIT
                    )
                ], [], [], [], []
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
                'Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', false,
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
                'ticket-edit-form-field-responsible',
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Responsible',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE_PRELOAD_PATTERN, '*'),
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
                'Translatable#State', TicketProperty.STATE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketEdit_State',
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
                ]
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
    return new Extension();
};
