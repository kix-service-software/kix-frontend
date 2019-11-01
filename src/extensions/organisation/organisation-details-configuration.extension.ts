/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, ContactProperty,
    DataType, KIXObjectType, OrganisationProperty, KIXObjectProperty,
    CRUD, KIXObjectLoadingOptions, TabWidgetConfiguration, ObjectInformationWidgetConfiguration
} from '../../core/model';
import { TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration } from '../../core/browser';
import { OrganisationDetailsContext } from '../../core/browser/organisation';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const infoConfig = new ObjectInformationWidgetConfiguration(
            'organisation-details-object-information-config',
            'Organisation Information', ConfigurationType.ObjectInformation,
            KIXObjectType.ORGANISATION,
            [
                OrganisationProperty.NAME,
                OrganisationProperty.NUMBER,
                OrganisationProperty.URL,
                OrganisationProperty.STREET,
                OrganisationProperty.ZIP,
                OrganisationProperty.CITY,
                OrganisationProperty.COUNTRY,
                OrganisationProperty.COMMENT,
                KIXObjectProperty.VALID_ID,
                KIXObjectProperty.CREATE_BY,
                KIXObjectProperty.CREATE_TIME,
                KIXObjectProperty.CHANGE_BY,
                KIXObjectProperty.CHANGE_TIME
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(infoConfig);

        const organisationInfoLane = new WidgetConfiguration(
            'organisation-details-info-widget', 'Organisation Info Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Organisation Information', [],
            new ConfigurationDefinition(
                'organisation-details-object-information-config', ConfigurationType.ObjectInformation
            ),
            null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(organisationInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'organisation-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['organisation-details-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabConfig);

        const tabLane = new WidgetConfiguration(
            'organisation-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('organisation-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabLane);

        const columnFirstName = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-firstname', 'Firstname', ConfigurationType.TableColumn,
            ContactProperty.FIRSTNAME, true, false, true, true, 200, true, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(columnFirstName);

        const lastNameColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-lastname', 'Lastname', ConfigurationType.TableColumn,
            ContactProperty.LASTNAME, true, false, true, true, 200, true, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(lastNameColumn);

        const emailColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-email', 'Email', ConfigurationType.TableColumn,
            ContactProperty.EMAIL, true, false, true, true, 250, true, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(emailColumn);

        const loginColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-login', 'Login', ConfigurationType.TableColumn,
            ContactProperty.LOGIN, true, false, true, true, 200, true, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(loginColumn);

        const openTicketsColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-open-tickets', 'Open Tickets', ConfigurationType.TableColumn,
            ContactProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150, true, false, false, DataType.NUMBER
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(openTicketsColumn);

        const reminderTicketsColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-reminder-tickets', 'Reminder TIckets',
            ConfigurationType.TableColumn,
            ContactProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150, true, false, false, DataType.NUMBER
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(reminderTicketsColumn);

        const newTicketsColumn = new DefaultColumnConfiguration(
            'organisation-details-assigned-contacts-new-tickets', 'New Tickets', ConfigurationType.TableColumn,
            ContactProperty.CREATE_NEW_TICKET, true, false, false, true, 150,
            false, false, false, DataType.STRING, false, 'create-new-ticket-cell'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(newTicketsColumn);

        const assignedContactsTableConfig = new TableConfiguration(
            'organisation-details-assigned-contacts-table', 'Contacts Table', ConfigurationType.Table,
            KIXObjectType.CONTACT,
            new KIXObjectLoadingOptions(
                null, null, null,
                [ContactProperty.TICKET_STATS], null
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
        await ModuleConfigurationService.getInstance().saveConfiguration(assignedContactsTableConfig);

        const assignedContactsLane = new WidgetConfiguration(
            'organisation-details-assigned-contacts-widget', 'Assigned Contacts', ConfigurationType.Widget,
            'organisation-assigned-contacts-widget', 'Translatable#Assigned Contacts', [],
            new ConfigurationDefinition('organisation-details-assigned-contacts-table', ConfigurationType.Table),
            null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(assignedContactsLane);

        const assignedTicketsLane = new WidgetConfiguration(
            'organisation-details-assigned-tickets-widget', 'Assigned Tickets', ConfigurationType.Widget,
            'organisation-assigned-tickets-widget', 'Translatable#Overview Tickets',
            ['organisation-create-ticket-action'], null, null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(assignedTicketsLane);

        return new ContextConfiguration(
            this.getModuleId(), 'Organisation Details', ConfigurationType.Context,
            this.getModuleId(), [], [],
            [
                new ConfiguredWidget('organisation-details-tab-widget', 'organisation-details-tab-widget'),
                new ConfiguredWidget(
                    'organisation-details-assigned-contacts-widget', 'organisation-details-assigned-contacts-widget',
                    null, [new UIComponentPermission('contacts', [CRUD.READ])]
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
                'organisation-edit-action', 'contact-create-action', 'ticket-create-action',
                'config-item-create-action', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('organisation-details-info-widget', 'organisation-details-info-widget')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
