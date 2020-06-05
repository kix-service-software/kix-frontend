/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { ContactDetailsContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
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
import { RoutingConfiguration } from '../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../model/ContextMode';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const userRouting = new RoutingConfiguration(
            'user-details', KIXObjectType.USER,
            ContextMode.DETAILS, ContactProperty.ASSIGNED_USER_ID, false
        );

        const infoConfig = new ObjectInformationWidgetConfiguration(
            'contact-details-object-information-config', 'Contact Info', ConfigurationType.ObjectInformation,
            KIXObjectType.CONTACT,
            [
                ContactProperty.TITLE,
                ContactProperty.FIRSTNAME,
                ContactProperty.LASTNAME,
                UserProperty.USER_LOGIN,
                UserProperty.USER_ACCESS,
                UserProperty.USER_LANGUAGE,
                ContactProperty.PRIMARY_ORGANISATION_ID,
                ContactProperty.PHONE,
                ContactProperty.MOBILE,
                ContactProperty.FAX,
                ContactProperty.EMAIL,
                ContactProperty.STREET,
                ContactProperty.ZIP,
                ContactProperty.CITY,
                ContactProperty.COUNTRY,
                ContactProperty.COMMENT,
                KIXObjectProperty.VALID_ID,
                KIXObjectProperty.CREATE_BY,
                KIXObjectProperty.CREATE_TIME,
                KIXObjectProperty.CHANGE_BY,
                KIXObjectProperty.CHANGE_TIME
            ], false,
            [
                [UserProperty.USER_LOGIN, userRouting],
            ]
        );
        configurations.push(infoConfig);

        const contactInfoWidget = new WidgetConfiguration(
            'contact-details-info-widget', 'Contact Info Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Contact Information', [],
            new ConfigurationDefinition(
                'contact-details-object-information-config', ConfigurationType.ObjectInformation
            ),
            null, false, true, null, false
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

        const assignedTicketsLane = new WidgetConfiguration(
            'contact-details-assigned-tickets-widget', 'Assigned Tickets', ConfigurationType.Widget,
            'contact-assigned-tickets-widget', 'Translatable#Overview Tickets',
            ['contact-create-ticket-action'], null, null, false, true, null, false
        );
        configurations.push(assignedTicketsLane);

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
                        'contact-details-assigned-tickets-widget', 'contact-details-assigned-tickets-widget', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])]
                    )
                ],
                [],
                [
                    'contact-create-action'
                ],
                [
                    'contact-edit-action', 'contact-duplicate-action', 'organisation-create-action',
                    'ticket-create-action', 'config-item-create-action', 'print-action'
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

module.exports = (data, host, options) => {
    return new Extension();
};
