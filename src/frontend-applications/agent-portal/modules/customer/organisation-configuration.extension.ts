/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { OrganisationProperty } from './model/OrganisationProperty';
import { SortOrder } from '../../model/SortOrder';
import { ContactProperty } from './model/ContactProperty';
import { OrganisationContext } from './webapp/core/context/OrganisationContext';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const organisationsTable = new TableConfiguration(
            'customer-dashboard-table', 'Organisations Table', ConfigurationType.Table,
            KIXObjectType.ORGANISATION, null, null,
            null, null, true
        );
        configurations.push(organisationsTable);

        const organsiationTableWidget = new TableWidgetConfiguration(
            'customer-dashboard-table-widget', 'Organisation Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.ORGANISATION, [OrganisationProperty.NAME, SortOrder.UP],
            new ConfigurationDefinition('customer-dashboard-table', ConfigurationType.Table)
        );
        configurations.push(organsiationTableWidget);

        const organisationTableWidget = new WidgetConfiguration(
            'customer-dashboard-organisations-widget', 'Organisations Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Organisations',
            ['import-action', 'organisation-csvexport-action'],
            new ConfigurationDefinition('customer-dashboard-table-widget', ConfigurationType.TableWidget), null,
            false, true, 'kix-icon-man-house', true
        );
        configurations.push(organisationTableWidget);

        const contactsTable = new TableConfiguration(
            'customer-dashboard-contacts-table', 'Contact Table', ConfigurationType.Table,
            KIXObjectType.CONTACT, null, null, null, null, true
        );
        configurations.push(contactsTable);

        const contactTableWidget = new TableWidgetConfiguration(
            'customer-dashboard-contacts-table-widget', 'Contacts Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.CONTACT, [ContactProperty.LASTNAME, SortOrder.UP],
            new ConfigurationDefinition('customer-dashboard-contacts-table', ConfigurationType.Table)
        );
        configurations.push(contactTableWidget);

        const contactListWidget = new WidgetConfiguration(
            'customer-dashboard-contacts-widget', 'Contacts Widget', ConfigurationType.Widget,
            'contact-list-widget', 'Translatable#Overview Contacts',
            ['import-action', 'contact-csv-export-action'],
            new ConfigurationDefinition(
                'customer-dashboard-contacts-table-widget', ConfigurationType.TableWidget
            ),
            null, false, true, 'kix-icon-man-bubble', true
        );
        configurations.push(contactListWidget);

        const contextConfig = new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [],
            [], [],
            [
                new ConfiguredWidget(
                    'customer-dashboard-organisations-widget', 'customer-dashboard-organisations-widget', null,
                    [new UIComponentPermission('organisations', [CRUD.READ])]
                ),
                new ConfiguredWidget(
                    'customer-dashboard-contacts-widget', 'customer-dashboard-contacts-widget', null,
                    [new UIComponentPermission('contacts', [CRUD.READ])]
                )
            ]
        );
        contextConfig.tableWidgetInstanceIds = [
            [KIXObjectType.ORGANISATION, 'customer-dashboard-organisations-widget'],
            [KIXObjectType.CONTACT, 'customer-dashboard-contacts-widget']
        ];
        configurations.push(contextConfig);

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
