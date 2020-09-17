/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
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
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ContextMode } from '../../model/ContextMode';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { ObjectReferenceWidgetConfiguration } from '../base-components/webapp/core/ObjectReferenceWidgetConfiguration';
import { DynamicFormFieldOption } from '../dynamic-fields/webapp/core';
import { ObjectIcon } from '../icon/model/ObjectIcon';
import { SearchOperator } from '../search/model/SearchOperator';
import { ArticleProperty } from './model/ArticleProperty';
import { QueueProperty } from './model/QueueProperty';
import { TicketProperty } from './model/TicketProperty';
import { NewTicketDialogContext } from './webapp/core';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const contactInfoCard = new WidgetConfiguration(
            'ticket-new-contact-card-widget', 'Contact Info Widget', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#Contact Information', [], null,
            {
                avatar: new ObjectIcon(
                    null, KIXObjectType.CONTACT, '<KIX_CONTACT_ID>', null, null, 'kix-icon-man'
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
            'ticket-new-dialog-object-reference-widget', 'Tickets for Assets', ConfigurationType.Widget,
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
            'ticket-new-dialog-suggested-faq-widget', 'Suggested FAQ', ConfigurationType.Widget,
            'referenced-objects-widget', 'Translatable#Suggested FAQ', [], null,
            new ObjectReferenceWidgetConfiguration(
                'ticket-new-suggested-faq-config', 'Suggested FAQ',
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
                    new ConfiguredWidget('ticket-new-contact-card-widget', 'ticket-new-contact-card-widget'),
                    new ConfiguredWidget(
                        'ticket-new-dialog-object-reference-widget', 'ticket-new-dialog-object-reference-widget'
                    ),
                    new ConfiguredWidget(
                        'ticket-new-dialog-suggested-faq-widget', 'ticket-new-dialog-suggested-faq-widget'
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

module.exports = (data, host, options) => {
    return new Extension();
};
