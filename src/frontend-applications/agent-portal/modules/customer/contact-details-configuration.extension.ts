/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContactProperty } from './model/ContactProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { DefaultColumnConfiguration } from '../../model/configuration/DefaultColumnConfiguration';
import { OrganisationProperty } from './model/OrganisationProperty';
import { DataType } from '../../model/DataType';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { UserProperty } from '../user/model/UserProperty';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ObjectIcon } from '../icon/model/ObjectIcon';
import { SearchOperator } from '../search/model/SearchOperator';
import { InformationConfiguration, InformationRowConfiguration, ObjectInformationCardConfiguration } from '../base-components/webapp/components/object-information-card-widget/ObjectInformationCardConfiguration';
import { UIFilterCriterion } from '../../model/UIFilterCriterion';
import { TicketProperty } from '../ticket/model/TicketProperty';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { ContactDetailsContext } from './webapp/core/context/ContactDetailsContext';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations: IConfiguration[] = [];

        const contactInfoWidget = new WidgetConfiguration(
            'contact-details-info-widget', 'Contact Info Widget', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#Contact Information', [], null,
            new ObjectInformationCardConfiguration(
                [],
                [
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'icon',
                                    {
                                        icon: new ObjectIcon(
                                            null, KIXObjectType.CONTACT, '<KIX_CONTACT_ID>', null, null, 'kix-icon-man-bubble'
                                        ),
                                        style: 'width: 5rem;height:5rem;font-size:5rem;'
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.TITLE
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.FIRSTNAME
                                    }
                                ),
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.LASTNAME
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.PRIMARY_ORGANISATION_ID
                                    }
                                ),
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: KIXObjectProperty.VALID_ID
                                    }
                                )
                            ]
                        ], null, '', true
                    ),
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: UserProperty.USER_LOGIN
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: UserProperty.USER_ACCESS
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: UserProperty.USER_LANGUAGE
                                    }
                                )
                            ]
                        ], null, null, true
                    ),
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.PHONE
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.MOBILE
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.FAX
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.EMAIL
                                    }
                                )
                            ]
                        ], null, null, true
                    ),
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.STREET
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.ZIP
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.CITY
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ContactProperty.COUNTRY
                                    }
                                )
                            ]
                        ], null, null, true
                    ),
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: KIXObjectProperty.CREATE_TIME
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: KIXObjectProperty.CREATE_BY
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: KIXObjectProperty.CHANGE_TIME
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: KIXObjectProperty.CHANGE_BY
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: 'DynamicFields.Source'
                                    },
                                    [
                                        new UIFilterCriterion(
                                            'DynamicFields.Source',
                                            SearchOperator.NOT_EQUALS,
                                            null
                                        )
                                    ]
                                )
                            ]
                        ], null, null, true
                    ),
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: OrganisationProperty.COMMENT
                                    }
                                )
                            ]
                        ]
                    )
                ]
            ), false, true, null, false
        );
        configurations.push(contactInfoWidget);

        const tabConfig = new TabWidgetConfiguration(
            'contact-details-tab-widget-config', 'Tab Config', ConfigurationType.TabWidget,
            ['contact-details-info-widget']
        );
        configurations.push(tabConfig);

        const tabWidget = new WidgetConfiguration(
            'contact-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('contact-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabWidget);

        const organisationNumber = new DefaultColumnConfiguration(
            'contact-details-assigned-organisation-number', 'Organisation Number', ConfigurationType.TableColumn,
            OrganisationProperty.NUMBER, true, false, true, true, 230, true, true
        );
        configurations.push(organisationNumber);

        const organisationName = new DefaultColumnConfiguration(
            'contact-details-assigned-organisation-name', 'Organisation Name', ConfigurationType.TableColumn,
            OrganisationProperty.NAME, true, false, true, true, 300, true, true
        );
        configurations.push(organisationName);

        const organisationCountry = new DefaultColumnConfiguration(
            'contact-details-assigned-organisation-country', 'Organisation Country', ConfigurationType.TableColumn,
            OrganisationProperty.COUNTRY, true, false, true, true, 175, true, true
        );
        configurations.push(organisationCountry);

        const organisationCity = new DefaultColumnConfiguration(
            'contact-details-assigned-organisation-city', 'Organisation City', ConfigurationType.TableColumn,
            OrganisationProperty.CITY, true, false, true, true, 175, true, true
        );
        configurations.push(organisationCity);

        const organisationStreet = new DefaultColumnConfiguration(
            'contact-details-assigned-organisation-street', 'Organisation Street', ConfigurationType.TableColumn,
            OrganisationProperty.STREET, true, false, true, true, 250, true, true
        );
        configurations.push(organisationStreet);

        const organisationOpenTicketCount = new DefaultColumnConfiguration(
            'contact-details-assigned-organisation-open-tickets',
            'Organisation Open Tickets', ConfigurationType.TableColumn,
            OrganisationProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150,
            true, false, false, DataType.NUMBER
        );
        configurations.push(organisationOpenTicketCount);

        const organisationReminderTicketCount = new DefaultColumnConfiguration(
            'contact-details-assigned-organisation-reminder-tickets',
            'Organisation Reminder', ConfigurationType.TableColumn,
            OrganisationProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150,
            true, false, false, DataType.NUMBER
        );
        configurations.push(organisationReminderTicketCount);

        const tableConfig = new TableConfiguration(
            'contact-details-assigned-organisations-table', 'Assigned Organisations', ConfigurationType.Table,
            KIXObjectType.ORGANISATION,
            new KIXObjectLoadingOptions(null, null, null, [OrganisationProperty.TICKET_STATS], null),
            null, [],
            [
                'contact-details-assigned-organisation-number',
                'contact-details-assigned-organisation-name',
                'contact-details-assigned-organisation-country',
                'contact-details-assigned-organisation-city',
                'contact-details-assigned-organisation-street',
                'contact-details-assigned-organisation-open-tickets',
                'contact-details-assigned-organisation-reminder-tickets'
            ], null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        configurations.push(tableConfig);

        const assignedOrganisationsLane = new WidgetConfiguration(
            'contact-details-assigned-organisations-widget', 'Assigned Organisations', ConfigurationType.Widget,
            'contact-assigned-organisations-widget', 'Translatable#Assigned Organisations', [],
            new ConfigurationDefinition('contact-details-assigned-organisations-table', ConfigurationType.Table),
            null, false, true, null, false
        );
        configurations.push(assignedOrganisationsLane);

        const assignedConfigItemsLane = new WidgetConfiguration(
            'contact-details-assigned-config-items-widget', 'Assigned Assets', ConfigurationType.Widget,
            'contact-assigned-config-items-widget', 'Translatable#Assigned Assets',
            [], null, new TableConfiguration(
                null, null, ConfigurationType.Table,
                KIXObjectType.CONFIG_ITEM, null, null, null, null, null, null, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            ), false, true, null, false
        );
        configurations.push(assignedConfigItemsLane);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Contact Details', ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('contact-details-tab-widget', 'contact-details-tab-widget'),
                    new ConfiguredWidget(
                        'contact-details-assigned-organisations-widget',
                        'contact-details-assigned-organisations-widget',
                        null, [new UIComponentPermission('organisations', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'contact-details-assigned-config-items-widget',
                        'contact-details-assigned-config-items-widget',
                        null, [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'contact-details-assigned-tickets-widget', null,
                        new WidgetConfiguration(
                            'contact-assigned-tickets-widget', 'Contact Tickets Widget', ConfigurationType.Widget,
                            'table-widget', 'Translatable#Assigned Tickets', [], null,
                            new TableWidgetConfiguration(
                                'contact-assigned-tickets-table-widget', 'Contact Assigned Tickets Table Widget',
                                ConfigurationType.TableWidget, KIXObjectType.TICKET, null, null,
                                new TableConfiguration(
                                    'contact-assigned-tickets-table', 'Contact Assigned Ticket Table',
                                    ConfigurationType.Table, KIXObjectType.TICKET,
                                    new KIXObjectLoadingOptions(
                                        [
                                            new FilterCriteria(
                                                TicketProperty.STATE_TYPE, SearchOperator.EQUALS,
                                                FilterDataType.STRING, FilterType.AND, 'Open'
                                            ),
                                            new FilterCriteria(
                                                TicketProperty.CONTACT_ID, SearchOperator.EQUALS,
                                                FilterDataType.NUMERIC, FilterType.AND, '<KIX_CONTACT_ID>'
                                            )
                                        ],
                                        'Ticket.-ChangeTime',
                                        100,
                                        [KIXObjectProperty.DYNAMIC_FIELDS]
                                    ), 15,
                                    [
                                        new DefaultColumnConfiguration(null, null, null,
                                            TicketProperty.PRIORITY_ID, false, true, true, false, 65,
                                            true, true, true, DataType.STRING, false
                                        ),
                                        new DefaultColumnConfiguration(
                                            null, null, null, TicketProperty.TICKET_NUMBER, true,
                                            false, true, false, 135, true, true, false, undefined, true,
                                            undefined, undefined, false
                                        ),
                                        new DefaultColumnConfiguration(
                                            null, null, null, TicketProperty.TITLE, true, false, true,
                                            false, 160, true, true, false, undefined, true, undefined, undefined, false
                                        ),
                                        new DefaultColumnConfiguration(
                                            null, null, null, TicketProperty.STATE_ID, true, true, true,
                                            false, 150, true, true, true
                                        ),
                                        new DefaultColumnConfiguration(null, null, null,
                                            TicketProperty.QUEUE_ID, true, false, true, false, 100, true, true, true
                                        ),
                                        new DefaultColumnConfiguration(null, null, null,
                                            TicketProperty.ORGANISATION_ID, true, false, true, false, 150, true, true
                                        ),
                                        new DefaultColumnConfiguration(null, null, null,
                                            TicketProperty.CHANGED, true, false, true, false,
                                            125, true, true, false, DataType.DATE_TIME
                                        ),
                                        new DefaultColumnConfiguration(null, null, null,
                                            'DynamicFields.AffectedAsset', true, false, true, false, 200, true, true,
                                            true, undefined, true, 'label-list-cell-content'
                                        )
                                    ]
                                ), null, false
                            )
                        ),
                        [new UIComponentPermission('tickets', [CRUD.READ])]
                    )
                ],
                [],
                [
                    'contact-create-action'
                ],
                [
                    'contact-edit-action', 'contact-duplicate-action', 'organisation-create-action',
                    'ticket-create-action', 'config-item-create-action'
                ],
                [],
                [
                    new ConfiguredWidget('contact-details-info-widget', 'contact-details-info-widget')
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
