/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { OrganisationDetailsContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { OrganisationProperty } from './model/OrganisationProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { DefaultColumnConfiguration } from '../../model/configuration/DefaultColumnConfiguration';
import { ContactProperty } from './model/ContactProperty';
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

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const organisationInfoLane = new WidgetConfiguration(
            'organisation-details-info-widget', 'Organisation Info Widget', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#Organisation Information', [],
            null,
            {
                avatar: [],
                rows: [
                    {
                        style: '',
                        separator: true,
                        values: [
                            [
                                {
                                    componentId: 'icon',
                                    componentData: {
                                        icon: new ObjectIcon(
                                            null, KIXObjectType.ORGANISATION, '<KIX_ORG_ID>', null, null, 'kix-icon-man-house'
                                        ),
                                        style: 'max-width: 15rem;width: unset;height: unset'
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.NUMBER
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.NAME
                                    }
                                },
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: 'DynamicFields.Type'
                                    }
                                },
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.URL
                                    }
                                },
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: KIXObjectProperty.VALID_ID
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        style: '',
                        separator: true,
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.STREET
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.ZIP
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.CITY
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.COUNTRY
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        style: '',
                        separator: true,
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: KIXObjectProperty.CREATE_TIME
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: KIXObjectProperty.CREATE_BY
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: KIXObjectProperty.CHANGE_TIME
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: KIXObjectProperty.CHANGE_BY
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        style: '',
                        separator: false,
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: OrganisationProperty.COMMENT
                                    }
                                }
                            ]
                        ]
                    }
                ]
            }, false, true, null, false
        );
        configurations.push(organisationInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'organisation-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['organisation-details-info-widget']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'organisation-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('organisation-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        const columnFirstName = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-firstname', 'Firstname', ConfigurationType.TableColumn,
            ContactProperty.FIRSTNAME, true, false, true, true, 200, true, true
        );
        configurations.push(columnFirstName);

        const lastNameColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-lastname', 'Lastname', ConfigurationType.TableColumn,
            ContactProperty.LASTNAME, true, false, true, true, 200, true, true
        );
        configurations.push(lastNameColumn);

        const emailColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-email', 'Email', ConfigurationType.TableColumn,
            ContactProperty.EMAIL, true, false, true, true, 250, true, true
        );
        configurations.push(emailColumn);

        const loginColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-login', 'Login', ConfigurationType.TableColumn,
            UserProperty.USER_LOGIN, true, false, true, true, 200, true, true
        );
        configurations.push(loginColumn);

        const openTicketsColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-open-tickets', 'Open Tickets', ConfigurationType.TableColumn,
            ContactProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150, true, false, false, DataType.NUMBER
        );
        configurations.push(openTicketsColumn);

        const reminderTicketsColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-reminder-tickets', 'Reminder TIckets',
            ConfigurationType.TableColumn,
            ContactProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150, true, false, false, DataType.NUMBER
        );
        configurations.push(reminderTicketsColumn);

        const newTicketsColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-new-tickets', 'New Tickets', ConfigurationType.TableColumn,
            ContactProperty.CREATE_NEW_TICKET, true, false, false, true, 150,
            false, false, false, DataType.STRING, false, 'create-new-ticket-cell'
        );
        configurations.push(newTicketsColumn);

        const assignedContactsTableConfig = new TableConfiguration(
            'organisation-details-assigned-contacts-table', 'Contacts Table', ConfigurationType.Table,
            KIXObjectType.CONTACT,
            new KIXObjectLoadingOptions(
                null, null, null,
                [ContactProperty.TICKET_STATS, ContactProperty.USER], null
            ), null, null,
            [
                'organisation-details-assigned-contacts-firstname',
                'organisation-details-assigned-contacts-lastname',
                'organisation-details-assigned-contacts-email',
                'organisation-details-assigned-contacts-login',
                'organisation-details-assigned-contacts-open-tickets',
                'organisation-details-assigned-contacts-reminder-tickets',
                'organisation-details-assigned-contacts-new-tickets'
            ], null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        configurations.push(assignedContactsTableConfig);

        const assignedContactsLane = new WidgetConfiguration(
            'organisation-details-assigned-contacts-widget', 'Assigned Contacts', ConfigurationType.Widget,
            'organisation-assigned-contacts-widget', 'Translatable#Assigned Contacts', [],
            new ConfigurationDefinition('organisation-details-assigned-contacts-table', ConfigurationType.Table),
            null, false, true, null, false
        );
        configurations.push(assignedContactsLane);

        const assignedConfigItemsLane = new WidgetConfiguration(
            'organisation-details-assigned-config-items-widget', 'Assigned Assets', ConfigurationType.Widget,
            'organisation-assigned-config-items-widget', 'Translatable#Assigned Assets',
            [], null, new TableConfiguration(
                null, null, ConfigurationType.Table,
                KIXObjectType.CONFIG_ITEM, null, null, null, null, null, null, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            ), false, true, null, false
        );
        configurations.push(assignedConfigItemsLane);

        const assignedTicketsLane = new WidgetConfiguration(
            'organisation-details-assigned-tickets-widget', 'Assigned Tickets', ConfigurationType.Widget,
            'organisation-assigned-tickets-widget', 'Translatable#Overview Tickets',
            ['organisation-create-ticket-action'], null, null, false, true, null, false
        );
        configurations.push(assignedTicketsLane);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Organisation Details', ConfigurationType.Context,
                this.getModuleId(), [], [],
                [
                    new ConfiguredWidget('organisation-details-tab-widget', 'organisation-details-tab-widget'),
                    new ConfiguredWidget(
                        'organisation-details-assigned-contacts-widget',
                        'organisation-details-assigned-contacts-widget',
                        null, [new UIComponentPermission('contacts', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'organisation-details-assigned-config-items-widget',
                        'organisation-details-assigned-config-items-widget',
                        null, [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'organisation-details-assigned-tickets-widget', 'organisation-details-assigned-tickets-widget',
                        null, [new UIComponentPermission('tickets', [CRUD.READ])]
                    )
                ],
                [],
                [
                    'organisation-create-action'
                ],
                [
                    'organisation-edit-action', 'organisation-duplicate-action', 'contact-create-action',
                    'ticket-create-action', 'config-item-create-action'
                ],
                [],
                [
                    new ConfiguredWidget('organisation-details-info-widget', 'organisation-details-info-widget')
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
